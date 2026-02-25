<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

/* =================== CORE HTTP =================== */

function fd_normalizar_ruta($path) {
    if ($path === '' || $path === null) return '/';
    if ($path[0] !== '/') return '/' . $path;
    return $path;
}

function fd_http($method, $baseUrl, $path, $headers, $body, $verifyTls, $apiVersion, $withHeadersOut = null, $expectStatus = null) {
    /* $start = floor(microtime(true) * 1000); */
    $url = rtrim($baseUrl, '/') . fd_normalizar_ruta($path);

    $ch = curl_init($url);
    $httpHeaders = array();

    if (is_array($headers)) {
        foreach ($headers as $h) $httpHeaders[] = $h;
    }

    if ($apiVersion !== null && $apiVersion !== '') {
        $httpHeaders[] = 'API-VERSION: ' . $apiVersion;
    }

    $m = strtoupper($method);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $m);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_PROXY, '');
    if (defined('CURLOPT_NOPROXY')) curl_setopt($ch, CURLOPT_NOPROXY, '*');

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    if (!$verifyTls) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    }

    $resp = curl_exec($ch);
    if ($resp === false) {
        $err = curl_error($ch);
        curl_close($ch);
        throw new RuntimeException('cURL error: ' . $err);
    }

    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $rawHeaders = substr($resp, 0, $headerSize);
    $rawBody    = substr($resp, $headerSize);
    curl_close($ch);

    // Parse headers
    $headersOut = array();
    $lines = preg_split("/\r\n|\n|\r/", $rawHeaders);
    foreach ($lines as $line) {
        $p = strpos($line, ':');
        if ($p !== false) {
            $name  = trim(substr($line, 0, $p));
            $value = trim(substr($line, $p + 1));
            $headersOut[$name] = $value;
        }
    }

    if (is_array($withHeadersOut)) {
        foreach ($headersOut as $k=>$v) $withHeadersOut[$k] = $v; // copiar si pasaron ref
    }

    if (is_array($expectStatus) && count($expectStatus) > 0) {
        if (!in_array($status, $expectStatus)) { // Simplificación de un loop con booleano
            $th = new RuntimeException("HTTP {$status} en {$url}. JSON$rawBody");
            throw $th;
        }
    } else if ($status >= 400) {
        $th = new RuntimeException("HTTP {$status} en {$url}. JSON$rawBody");
        throw $th;
    }

    // Decode JSON si procede
    $data = null;
    if ($rawBody !== '' && $rawBody !== null) {
        $data = $rawBody;

        $tmp = json_decode($rawBody, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $data = $tmp;
        }
    }

    /* $end = floor(microtime(true) * 1000);  */
    /* $time = ($end - $start) / 1000; // En segundos */
    /**/
    /* echo sprintf("path: %s, elapsed_time: %.2f seconds\n", $path, $time); */
    return array('status'=>$status, 'headers'=>$headersOut, 'data'=>$data, 'raw'=>$rawBody);
}

/* =================== SESIÓN (LOGIN/LOGOUT) =================== */

function fd_iniciar_sesion(&$ctx, $baseUrl, $usuario, $clave, $verificarTls = true, $versionApi = '0.9') {
    $ctx = array();
    $ctx['base_url'] = rtrim($baseUrl, '/');
    $ctx['verify_tls'] = (bool)$verificarTls;
    $ctx['api_version'] = $versionApi;
    $ctx['auth_mode'] = 'session';
    $ctx['x_auth_token'] = null;
    $ctx['session_location'] = null;

    $headers = array('Accept: application/json', 'Content-Type: application/json');
    $payload = json_encode(array('UserName'=>$usuario, 'Password'=>$clave));
    $outHeaders = array();

    $r = fd_http('POST', $ctx['base_url'], '/redfish/v1/SessionService/Sessions',
                 $headers, $payload, $ctx['verify_tls'], $ctx['api_version'],
                 $outHeaders, array(201));

    // token y location
    $token = null;
    if (isset($r['headers']['X-Auth-Token'])) $token = $r['headers']['X-Auth-Token'];
    if ($token === null && isset($r['headers']['x-auth-token'])) $token = $r['headers']['x-auth-token'];

    $loc = null;
    if (isset($r['headers']['Location'])) $loc = $r['headers']['Location'];
    if ($loc === null && isset($r['headers']['location'])) $loc = $r['headers']['location'];

    if ($token === null) throw new RuntimeException('No se recibió X-Auth-Token al crear sesión.');

    $ctx['x_auth_token'] = $token;
    $ctx['session_location'] = $loc;
    return true;
}

function fd_cerrar_sesion(&$ctx) {
    if (!is_array($ctx)) return;
    $mode = '';
    if (isset($ctx['auth_mode'])) $mode = $ctx['auth_mode'];
    if ($mode === 'session' && isset($ctx['session_location']) && $ctx['session_location']) {
        $headers = array('Accept: application/json', 'X-Auth-Token: ' . $ctx['x_auth_token']);
        @fd_http('DELETE', $ctx['base_url'], $ctx['session_location'], $headers, null, $ctx['verify_tls'], $ctx['api_version'], null, array(200,204));
    }
    $ctx['x_auth_token'] = null;
    $ctx['session_location'] = null;
}

/* =================== LISTAR NODOS =================== */

function fd_listar_nodos($ctx) {
    if (!is_array($ctx)) throw new RuntimeException('Contexto inválido.');
    $headers = array('Accept: application/json', 'X-Auth-Token: ' . $ctx['x_auth_token']);
    $r = fd_http('GET', $ctx['base_url'], '/redfish/v1/rich/Nodes', $headers, null, $ctx['verify_tls'], $ctx['api_version'], null, array(200));
    return $r['data'];
}

/* ========== HELPERS PARA TOKEN ========== */
function fd_crear_sesion_token(&$ctx_out = null) {
    $baseUrl = $_SESSION["FD"]->host;
    $usuario = $_SESSION["FD"]->user;
    $clave = $_SESSION["FD"]->password;
    $verificarTls = $_SESSION["FD"]->verify;
    $versionApi = $_SESSION["FD"]->apiV;
    $ctx_tmp = null;

    fd_iniciar_sesion($ctx_tmp, $baseUrl, $usuario, $clave, $verificarTls, $versionApi);

    if (isset($ctx_tmp['x_auth_token'])) $_SESSION["FD"]->token = $ctx_tmp['x_auth_token'];
    if (isset($ctx_tmp['session_location'])) $_SESSION["FD"]->loc = $ctx_tmp['session_location'];

    if (!is_null($ctx_out)) $ctx_out = $ctx_tmp;
    if ($_SESSION["FD"]->token === null) throw new RuntimeException('No se obtuvo X-Auth-Token.');

    register_shutdown_function(
        function () {
            if ($_SESSION["FD"]->token && $_SESSION["FD"]->loc) {
                @fd_cerrar_sesion_por_token();
            }
        },
    );

    return true;
}

function fd_listar_nodos_con_token($baseUrl, $xAuthToken, $verificarTls, $versionApi) {
    $ctx = array();
    $ctx['base_url'] = rtrim($baseUrl, '/');
    $ctx['verify_tls'] = (bool)$verificarTls;
    $ctx['api_version'] = $versionApi;
    $ctx['auth_mode'] = 'session';
    $ctx['x_auth_token'] = $xAuthToken;
    $ctx['session_location'] = null;
    return fd_listar_nodos($ctx);
}

function fd_cerrar_sesion_por_token() {
    $sessionLocation = $_SESSION["FD"]->loc ?? null;

    if (!$sessionLocation) return;

    $baseUrl = $_SESSION["FD"]->host;
    $xAuthToken = $_SESSION["FD"]->token;
    $verificarTls = $_SESSION["FD"]->verify;
    $versionApi = $_SESSION["FD"]->apiV;

    $headers = array('Accept: application/json', 'X-Auth-Token: ' . $xAuthToken);

    // La llamada con @ delante ignora la Exception, así no requiere el try-catch vacío
    @fd_http(
        'DELETE',
        rtrim($baseUrl, '/'),
        $sessionLocation,
        $headers,
        null,
        (bool)$verificarTls,
        $versionApi,
        null,
        array(200, 204),
    );

    // Vaciamos variables de sesión
    $_SESSION["FD"]->loc = null;
    $_SESSION["FD"]->token = null;
}

/* =================== LISTADO DETALLADO DE NODOS =================== */
/**
 * Devuelve un array de nodos en detalle (Id, Name, Status, Model, SerialNumber, @odata.id) */

 
function fd_listar_nodos_detalle($ctx) {
    if (!is_array($ctx)) throw new RuntimeException('Contexto inválido.');

    // 1) índice de nodos
    $headers = array('Accept: application/json', 'X-Auth-Token: ' . $ctx['x_auth_token']);
    $r = fd_http('GET', $ctx['base_url'], '/redfish/v1/rich/Nodes', $headers, null, $ctx['verify_tls'], $ctx['api_version'], null, array(200));
    $members = array();
    if (isset($r['data']['Members']) && is_array($r['data']['Members'])) { $members = $r['data']['Members']; }

    if (isset($ctx["id"]) && $ctx["id"] != "") {
        $nodos = [];
        foreach ($members as $m) {
            $uri = null;
            if (isset($m['@odata.id'])) { $uri = $m['@odata.id']; }
            if (!$uri) continue;

            if (basename($uri) != $ctx["id"]) {
                continue;
            }
            $nodos[] = $m;
        }
    } else {
        $nodos = $members;
    }

    // 2) recuperar cada nodo
    $out = array();
    foreach ($nodos as $m) {
        $uri = null;
        if (isset($m['@odata.id'])) { $uri = $m['@odata.id']; }
        if (!$uri) continue;

        $ri = fd_http('GET', $ctx['base_url'], $uri, $headers, null, $ctx['verify_tls'], $ctx['api_version'], null, array(200));
        $node = is_array($ri['data']) ? $ri['data'] : array();

        $status = array();
        if (isset($node['Status']) && is_array($node['Status'])) { $status = $node['Status']; }

        $item = array();
        $item['id'] = basename($uri);
        $item['Name'] = isset($node['Name']) ? $node['Name'] : (isset($node['Id']) ? $node['Id'] : basename($uri));
        $item['Status'] = array(
            'State'        => isset($status['State']) ? $status['State'] : null,
            'Health'       => isset($status['Health']) ? $status['Health'] : null,
            'HealthRollup' => isset($status['HealthRollup']) ? $status['HealthRollup'] : null,
            'Prediction' => prediccion_nodo($node),
        );
        $item['Model']        = isset($node['Model']) ? $node['Model'] : null;
        $item['SerialNumber'] = isset($node['SerialNumber']) ? $node['SerialNumber'] : null;
        $item['@odata.id']    = $uri;

        $out[] = $item;
    }
    return $out;
}

/**
 * Conveniencia: detalle por TOKEN (sin manejar $ctx fuera).
 */
function fd_listar_nodos_detalle_con_token($id = null) {
    $ctx = array();
    $ctx['base_url'] = rtrim($_SESSION["FD"]->host, '/');
    $ctx['verify_tls'] = (bool)$_SESSION["FD"]->verify;
    $ctx['api_version'] = $_SESSION["FD"]->apiV;
    $ctx['auth_mode'] = 'session';
    $ctx['x_auth_token'] = $_SESSION["FD"]->token;
    $ctx['session_location'] = null;
    $ctx['id'] = $id;

    $nodos = fd_listar_nodos_detalle($ctx);
    return $nodos;
}


/* =================== SALUD (RESUMEN) =================== */
/**
 * Calcula un resumen simple de salud a partir de nodos detallados.
 * Formato de salida: ['OK'=>N, 'Warning'=>N, 'Critical'=>N, 'Unknown'=>N]
 */
function fd_resumen_salud($nodos_detalle)
{
    $counts = array('OK'=>0, 'Warning'=>0, 'Critical'=>0, 'Unknown'=>0);
    foreach ($nodos_detalle as $n) {
        $h = 'Unknown';
        if (isset($n['Status']) && isset($n['Status']['Health'])) { $h = $n['Status']['Health']; }
        if (!array_key_exists($h, $counts)) { $h = 'Unknown'; }
        $counts[$h] = $counts[$h] + 1;
    }
    return $counts;
}

/* =================== PREDICCIONES (HEURÍSTICA LIGERA) =================== */
/**
 * Genera una predicción heurística de riesgo por nodo según Health/HealthRollup.
 * Devuelve: [{Id,Name,risk_score,prediction,basis:{Health,HealthRollup}}, ...]
 */
function prediccion_nodo($nodo, $min = true) {
    $health = 'Unknown';
    $rollup = null;
    if (isset($nodo['Status'])) {
        if (isset($nodo['Status']['Health'])) { $health = $nodo['Status']['Health']; }
        if (isset($nodo['Status']['HealthRollup'])) { $rollup = $nodo['Status']['HealthRollup']; }
    }

    // puntuación base + ajustes por estados (simple, interpretable)
    $risk = 0.15;
    if ($health === 'Warning') { $risk += 0.35; }
    else if ($health === 'Critical') { $risk += 0.75; }
    else if ($health !== 'OK') { $risk += 0.25; }

    if ($rollup === 'Warning') { $risk += 0.10; }
    else if ($rollup === 'Critical') { $risk += 0.25; }

    if ($risk < 0.0) $risk = 0.0;
    if ($risk > 1.0) $risk = 1.0;

    $prediction = 'Stable';
    $days = "7";
    if ($risk >= 0.7) { 
        $prediction = 'High risk of degradation';
        $days = "7-30";
    } else if ($risk >= 0.4) {
        $prediction = 'Medium risk of degradation';
        $days = "7-30";
    }

    $item = [
        'risk_score' => round($risk, 2),
        'prediction' => $prediction,
        'days' => $days,
    ];
    if ($min !== true) {
        $item['Id'] = isset($nodo['Id']) ? $nodo['Id'] : null;
        $item['Name'] = isset($nodo['Name']) ? $nodo['Name'] : null;
        $item['basis'] = array('Health'=>$health, 'HealthRollup'=>$rollup);
    }

    return $item;
}

function fd_predicciones_nodos($nodos_detalle) {
    $out = array();
    foreach ($nodos_detalle as $nodo) {
        $out[] = prediccion_nodo($nodo);
    }

    return $out;
}


/* =================== COMPONENTES Y RESUMEN DE NODO =================== */

/**
 * Obtiene cualquier subrecurso de un nodo:
 *  - "Memory", "Processors", "Storage", "EthernetInterfaces", "Thermal", "Power", "Bios", etc.
 */
function fd_obtener_componente_nodo($idNodo, $componente) {
    if ($componente === null) { $componente = ''; }
    $componente = ltrim($componente, '/');
    $path = '/redfish/v1/rich/Nodes/' . rawurlencode($idNodo) . '/' . $componente;

    $headers = array('Accept: application/json', 'X-Auth-Token: ' . $_SESSION["FD"]->token);

    $returnObj = [];
    try {
        $r = fd_http(
            'GET',
            rtrim($_SESSION["FD"]->host, '/'),
            $path,
            $headers,
            null,
            (bool)$_SESSION["FD"]->verify,
            $_SESSION["FD"]->apiV,
            null,
            array(200)
        );

        $returnObj = $r['data'];
    } catch (Throwable $th) {
        $returnObj = [
            "message" => "Ha habido un error al procesar la solicitud.",
            "ex" => $th->getMessage(),
            "error" => true,
        ];
    } finally {
        return $returnObj;
    }
}

/**
 * Obtiene cualquier subrecurso de un sistema:
 */
function fd_obtener_componente_sistema($idSistema, $componente) {
    if ($componente === null) { $componente = ''; }
    $componente = ltrim($componente, '/');
    $path = '/redfish/v1/Systems/' . rawurlencode($idSistema) . '/' . $componente;

    $headers = array('Accept: application/json', 'X-Auth-Token: ' . $_SESSION["FD"]->token);

    $returnObj = [];
    try {
        $r = fd_http(
            'GET',
            rtrim($_SESSION["FD"]->host, '/'),
            $path,
            $headers,
            null,
            (bool)$_SESSION["FD"]->verify,
            $_SESSION["FD"]->apiV,
            null,
            array(200)
        );

        $returnObj = $r['data'];
    } catch (Throwable $th) {
        $returnObj = [
            "message" => "Ha habido un error al procesar la solicitud.",
            "ex" => $th->getMessage(),
            "error" => true,
        ];
    } finally {
        return $returnObj;
    }
}

/**
 * Devuelve un resumen consolidado del nodo:
 *  IP, Hostname, Modelo, Número de serie, RAM (GiB), Almacenamiento total,
 *  Nº controladoras RAID, OS (nombre y kernel), iBMA (estado y versiones) y PowerState.
 *  Incluye "raw" con partes originales para depuración.
 */
function fd_resumen_nodo($idNodo) {
    $base = rtrim($_SESSION["FD"]->host, '/');
    $headers = array('Accept: application/json', 'X-Auth-Token: ' . $_SESSION["FD"]->token);
    $verify  = (bool)$_SESSION["FD"]->verify;
    $versionApi = $_SESSION["FD"]->apiV;

    // --- Nodo raíz
    $rutaNodo = '/redfish/v1/rich/Nodes/' . rawurlencode($idNodo);
    $rNode = fd_http('GET', $base, $rutaNodo, $headers, null, $verify, $versionApi, null, array(200));
    $nodo = is_array($rNode['data']) ? $rNode['data'] : array();

    // --- Ethernet / IP (primera IPv4 que aparezca)
    $ip = $nodo["IPAddress"] ?? null;
    $hostname = $nodo["BMC"]["HostName"] ?? null;

    $ethInt = [
        "Address" => $ip,
        "SubnetMask" => "",
        "Gateway" => "",
        "AddressOrigin" => ""
    ];
    $manager = fd_obtener_componente_nodo($idNodo, 'Manager');
    if ($manager && !isset($manager["error"])) {
        $ethInt = $manager["EthernetInterface"][0]["IPv4Addresses"][0];
    }

    // --- Storage: sumar capacidades y contar controladoras
    $storageDump = null; $numRaidCtl = 0;
    try {
        $storageDump = fd_obtener_componente_nodo($idNodo, 'Storage');
        if ($storageDump && !isset($storageDump["error"])) {
            $storageDump["Drive"] = fd_obtener_componente_nodo($idNodo, 'Storage/Drive');
            $storageDump["RaidCard"] = fd_obtener_componente_nodo($idNodo, 'Storage/RaidCard');

            if (isset($storageDump["RaidCard"]["Members"])) {
                $numRaidCtl = count($storageDump["RaidCard"]["Members"]);
            }
        }
    } catch (Exception) {
        // Storage puede no estar disponible; continuar
    }

    // --- OEM xFusion: Hostname, OS, iBMA
    $osNombre = null; $osKernel = null; $osVersion = null;
    $ibmaEstado = null; $ibmaServicio = null; $ibmaDriver = null;

    if (isset($nodo['Oem']) && isset($nodo['Oem']['xFusion'])) {
        $ox = $nodo['Oem']['xFusion'];
        if (isset($ox['iBMA'])) {
            $ib = $ox['iBMA'];
            if (isset($ib['State'])) { $ibmaEstado = $ib['State']; }
            if (isset($ib['ServiceVersion'])) { $ibmaServicio = $ib['ServiceVersion']; }
            if (isset($ib['DriverVersion'])) { $ibmaDriver = $ib['DriverVersion']; }
        }
    }

    if (isset($nodo['OSSummary'])) {
        $osi = $nodo['OSSummary'];
        if (isset($osi['Image'])) { $osNombre = $osi['Image']; }
        if (isset($osi['KernelVersion'])) { $osKernel = $osi['KernelVersion']; }
        if (isset($osi['OSVersion'])) { $osVersion = $osi['OSVersion']; }
    }

    // --- RAM y metadatos base
    $ramGiB = null;
    if (isset($nodo['MemorySummary']) && isset($nodo['MemorySummary']['TotalSystemMemoryGiB'])) {
        $ramGiB = $nodo['MemorySummary']['TotalSystemMemoryGiB'];
    }

    $totalStorageGiB = $nodo["StorageSummary"]["TotalSystemStorageGiB"];
    $totalStorageBytes = $totalStorageGiB * (1024*1024*1024);

    $modelo = isset($nodo['Model']) ? $nodo['Model'] : null;
    $serie  = isset($nodo['SerialNumber']) ? $nodo['SerialNumber'] : null;
    $power  = isset($nodo['PowerState']) ? $nodo['PowerState'] : null;

    $out = [
        'IP' => $ip,
        'EthernetInterface' => $ethInt,
        'Hostname' => $hostname,
        'Modelo' => $modelo,
        'NumeroSerie' => $serie,
        'RAM_GiB' => $ramGiB,
        'Almacenamiento_Bytes' => (float)$totalStorageBytes,
        'Almacenamiento_GiB' => $totalStorageGiB,
        'ControladorasRAID' => $numRaidCtl,
        'SO_Nombre' => $osNombre,
        'SO_Kernel' => $osKernel,
        'SO_Version' => $osVersion,
        'iBMA_VersionServicio' => $ibmaServicio,
        'iBMA_VersionDriver' => $ibmaDriver,
        'iBMA_Estado' => $ibmaEstado,
        'PowerState' => $power,
    ];

    // raw útiles para depurar
    /* $out['raw'] = array( */
    /*     'Nodo'      => $nodo, */
    /*     'Storage'   => $storageDump, */
    /* ); */

    return $out;
}

/**
 * Borra TODAS las sesiones visibles para el token actual. */
function fd_limpiar_todas_las_sesiones($baseUrl, $xAuthToken, $verificarTls, $versionApi)
{
    $base = rtrim($baseUrl, '/');
    $headers = array('Accept: application/json', 'X-Auth-Token: ' . $xAuthToken, 'API-VERSION: ' . $versionApi);
    $verify = (bool)$verificarTls;

    // 1) Listar sesiones
    $idx = fd_http('GET', $base, '/redfish/v1/SessionService/Sessions', $headers, null, $verify, $versionApi, null, array(200));
    $members = array();
    if (isset($idx['data']['Members']) && is_array($idx['data']['Members'])) { $members = $idx['data']['Members']; }

    // 2) Borrar cada sesión
    foreach ($members as $m) {
        $uri = null; if (isset($m['@odata.id'])) { $uri = $m['@odata.id']; }
        if (!$uri) continue;

        @fd_http('DELETE', $base, $uri, $headers, null, $verify, $versionApi, null, array(200,204));
    }
}

/* ======== para las acciones  ======== */

/* === Inicialización de sesión FD (opcional desde acciones.php) === */
function fd_init_config(array $opts = [], bool $login = true): void {
    if (session_status() !== PHP_SESSION_ACTIVE) { session_start(); }
    if (!isset($_SESSION["FD"]) || !is_object($_SESSION["FD"])) {
        $_SESSION["FD"] = (object)[
            'host' => null,
            'user' => null,
            'password' => null,
            'verify' => true,
            'apiV' => '0.9',
            'token' => null,
            'loc' => null,
        ];
    }

    foreach (['host','user','password','verify','apiV'] as $k) {
        if (array_key_exists($k, $opts)) { $_SESSION["FD"]->{$k} = $opts[$k]; }
    }

    // Crea token si procede
    if ($login && empty($_SESSION['FD']->token) && function_exists('fd_crear_sesion_token')) {
        try { fd_crear_sesion_token(); } catch (Throwable $e) { /* opcional: logging */ }
    }
}

/* === Headers con token actual de sesión === */
function fd_headers_session(): array {
    return array_filter([
        'Accept: application/json',
        'Content-Type: application/json',
        !empty($_SESSION['FD']->token) ? 'X-Auth-Token: '.$_SESSION['FD']->token : null,
        // API-VERSION lo añade fd_http automáticamente con $_SESSION["FD"]->apiV
    ]);
}

/* === Atajos a fd_http usando la sesión === */
function http_get(string $path, array $codes=[200]) {
    return fd_http('GET',
        rtrim($_SESSION['FD']->host,'/'),
        $path,
        fd_headers_session(),
        null,
        (bool)$_SESSION['FD']->verify,
        $_SESSION['FD']->apiV,
        $out=null,
        $codes
    );
}
function http_post(string $path, $body, array $codes=[200,201,202,204]) {
    return fd_http('POST',
        rtrim($_SESSION['FD']->host,'/'),
        $path,
        fd_headers_session(),
        is_string($body) ? $body : json_encode($body),
        (bool)$_SESSION['FD']->verify,
        $_SESSION['FD']->apiV,
        $out=null,
        $codes
    );
}
function http_patch(string $path, $body, array $codes=[200,202,204]) {
    return fd_http('PATCH',
        rtrim($_SESSION['FD']->host,'/'),
        $path,
        fd_headers_session(),
        is_string($body) ? $body : json_encode($body),
        (bool)$_SESSION['FD']->verify,
        $_SESSION['FD']->apiV,
        $out=null,
        $codes
    );
}
function http_delete(string $path, array $codes=[200,202,204]) {
    return fd_http('DELETE',
        rtrim($_SESSION['FD']->host,'/'),
        $path,
        fd_headers_session(),
        null,
        (bool)$_SESSION['FD']->verify,
        $_SESSION['FD']->apiV,
        $out=null,
        $codes
    );
}

/* === Normalizador de OK a partir del status (por si fd_http no devuelve 'ok') === */
function resp_ok(array $r): bool {
    $s = $r['status'] ?? 0;
    return isset($r['ok']) ? (bool)$r['ok'] : ($s >= 200 && $s < 300);
}

/* === IP/Host del iBMC usando EXCLUSIVAMENTE tu fd_resumen_nodo() === */
function get_ibmc_ip_from_resumen(string $nodeId): ?string {
    if (!function_exists('fd_resumen_nodo')) {
        throw new Exception("No existe fd_resumen_nodo() en el proyecto.");
    }
    $res = fd_resumen_nodo($nodeId);
    if (!is_array($res)) {
        throw new Exception("fd_resumen_nodo({$nodeId}) no devolvió un array.");
    }

    // Claves reales según tu implementación
    if (!empty($res['IP']) && $res['IP'] !== '0.0.0.0') return $res['IP'];
    if (!empty($res['Hostname'])) return $res['Hostname'];

    // Fallbacks por si en otros entornos cambia el shape
    if (!empty($res['IPAddress']) && $res['IPAddress'] !== '0.0.0.0') return $res['IPAddress'];
    if (!empty($res['BMC']['HostName'])) return $res['BMC']['HostName'];
    if (!empty($res['BMC']['IPv4Addresses']) && is_array($res['BMC']['IPv4Addresses'])) {
        foreach ($res['BMC']['IPv4Addresses'] as $addr) {
            if (!empty($addr['Address']) && $addr['Address'] !== '0.0.0.0') return $addr['Address'];
        }
    }
    if (!empty($res['BMC']['IPv4']) && $res['BMC']['IPv4'] !== '0.0.0.0') return $res['BMC']['IPv4'];
    if (!empty($res['Manager']['IPv4Address']['Address'])) return $res['Manager']['IPv4Address']['Address'];
    if (!empty($res['Manager']['HostName'])) return $res['Manager']['HostName'];

    return null;
}

/* === POWER vía API unificada de FD === */
function power_via_unified_api(string $ip, string $action) {
    // Action: On | ForceOff | ForceRestart | GracefulShutdown
    return http_post("/unifiedapi/v1/Managers/Actions/Managers.PowerOperation", [
        "IPAddresses" => [$ip],
        "Action"      => $action
    ], [200,201,202,204]);
}

/* === Consulta de estado de Task === */
function get_task_status(string $taskId) {
    // Ajusta la ruta si tu despliegue usa otra variante
    $route = "/unifiedapi/v1/Tasks";
    if ($taskId != "") {
        $route .= "/{$taskId}";
    }

    return http_get($route, [200,202]);
}

function get_task_history(string $nodeId) {
    // Ajusta la ruta si tu despliegue usa otra variante
    $route = "/redfish/v1/rich/Tasks/Actions/Task.Query?\$expand=.&\$skip=0&\$top=10";
    $body = (object)[];

    if ($nodeId != "") {
        $body->RelateResourceURI = "/redfish/v1/rich/Nodes/{$nodeId}";
    }

    $r = http_post($route, json_encode($body), [200,202]);
    if (isset($r["data"]["Members"]) && is_array($r["data"]["Members"])) {
        foreach ($r["data"]["Members"] as $key => $m) {
            $odata = http_get($m["@odata.id"], [200]);

            $r["data"]["Members"][$key] = $odata["data"];
        }
    }
    return $r;
}
