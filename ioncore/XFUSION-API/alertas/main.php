<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/main.php";

$ubicacion_env = __DIR__;
$nombre_env = "alrt.env";
$dotenv = Dotenv\Dotenv::createImmutable($ubicacion_env, $nombre_env);
$dotenv->safeLoad();

function fd_crear_suscripcion_eventos_alert_with_oem_auth(
    $destino, $contexto, $destUser, $destPass, $verifyCertBool, $eventTokenHeader // <-- NUEVO parámetro
) {
    $baseUrl = $_SESSION["FD"]->host;
    $xAuthToken = $_SESSION["FD"]->token;
    $verificarTls = $_SESSION["FD"]->verify;
    $versionApi = $_SESSION["FD"]->apiV;

    $base = rtrim($baseUrl, '/');
    $headers = array(
        'Accept: application/json',
        'Content-Type: application/json',
        'X-Auth-Token: ' . $xAuthToken
    );

    // HttpHeaders del webhook: OBJETO nombre->valor
    $basic = base64_encode($destUser . ':' . $destPass);
    $httpHeadersObj = array(
        'Authorization' => 'Basic ' . $basic,
        'X-Auth-Token'  => (string)$eventTokenHeader  // <-- requerido por tu FD
    );

    $body = array(
        'Destination' => $destino,
        'Protocol'    => 'Redfish',
        'EventTypes'  => array('Alert'),
        'Oem'         => array(
            'xFusion' => array(
                'VerifyCertificate' => (bool)$verifyCertBool,
                'UserName'          => (string)$destUser,
                'Password'          => (string)$destPass
            )
        ),
        'HttpHeaders' => $httpHeadersObj
    );
    if ($contexto !== null && $contexto !== '') {
        $body['Context'] = $contexto;
    }

    $json = json_encode($body, JSON_UNESCAPED_SLASHES);

    try {
        $resp = fd_http(
            'POST',
            $base,
            '/redfish/v1/EventService/Subscriptions',
            $headers,
            $json,
            (bool)$verificarTls,
            $versionApi,
            null,
            array(201)
        );
        return $resp['data'];
    } catch (Throwable $e) {
        throw new RuntimeException(
            'Error creando suscripción. PayloadEnviado=' . $json . ' | ErrorOriginal=' . $e->getMessage(),
            previous: $e
        );
    }
}

/** Helpers (sin cambios) */
function fa_listar_suscripciones_eventos() {
    $baseUrl = $_SESSION["FD"]->host;
    $xAuthToken = $_SESSION["FD"]->token;
    $verificarTls = $_SESSION["FD"]->verify;
    $versionApi = $_SESSION["FD"]->apiV;

    $base = rtrim($baseUrl, '/');
    $headers = array('Accept: application/json', 'X-Auth-Token: ' . $xAuthToken);
    $resp = fd_http('GET', $base, '/redfish/v1/EventService/Subscriptions', $headers, null, (bool)$verificarTls, $versionApi, null, array(200));
    return $resp['data'];
}

function fa_buscar_suscripcion_por_destino($destino) {
    $baseUrl = $_SESSION["FD"]->host;
    $xAuthToken = $_SESSION["FD"]->token;
    $verificarTls = $_SESSION["FD"]->verify;
    $versionApi = $_SESSION["FD"]->apiV;

    $lista = fa_listar_suscripciones_eventos();
    if (!isset($lista['Members']) || !is_array($lista['Members'])) return null;

    $base = rtrim($baseUrl, '/');
    $headers = array('Accept: application/json', 'X-Auth-Token: ' . $xAuthToken);

    foreach ($lista['Members'] as $m) {
        $oid = $m['@odata.id'] ?? null;
        if (!$oid) continue;
        $det = fd_http('GET', $base, $oid, $headers, null, (bool)$verificarTls, $versionApi, null, array(200));
        $d = $det['data'] ?? array();
        if (($d['Destination'] ?? null) === $destino) return $d;
    }
    return null;
}

function fa_eliminar_suscripcion_eventos($odataId) {
    if (!$odataId) throw new InvalidArgumentException('Falta parámetro odataId');

    $baseUrl = $_SESSION["FD"]->host;
    $xAuthToken = $_SESSION["FD"]->token;
    $verificarTls = $_SESSION["FD"]->verify;
    $versionApi = $_SESSION["FD"]->apiV;

    $base = rtrim($baseUrl, '/');
    $headers = array('Accept: application/json', 'X-Auth-Token: ' . $xAuthToken);
    fd_http('DELETE', $base, $odataId, $headers, null, (bool)$verificarTls, $versionApi, null, array(200,204));
    return true;
}
