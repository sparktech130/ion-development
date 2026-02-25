<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/vendor/autoload.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/cors.php";

// Variables de entorno
$ubicacion_env = $_SERVER["DOCUMENT_ROOT"];
$nombre_env = ".env";
$dotenv = Dotenv\Dotenv::createImmutable($ubicacion_env, $nombre_env);
$dotenv->safeLoad();

// Forzar variables de Docker Compose (tienen prioridad sobre .env)
// Estas se pasan desde docker-compose.yml en la sección environment
if (getenv('MYSQL_HOST') !== false) $_ENV['MYSQL_HOST'] = getenv('MYSQL_HOST');
if (getenv('MYSQL_PORT') !== false) $_ENV['MYSQL_PORT'] = getenv('MYSQL_PORT');
if (getenv('DB_HOST') !== false) $_ENV['DB_HOST'] = getenv('DB_HOST');
if (getenv('DB_PORT') !== false) $_ENV['DB_PORT'] = getenv('DB_PORT');

// URLs AWS CONSTANTES
$SOCKET_API_CAMBIOS_URL = "https://ec2-52-28-246-249.eu-central-1.compute.amazonaws.com";
$API_S3_URL = "http://ec2-3-122-171-241.eu-central-1.compute.amazonaws.com";

if (isset($_SESSION)) {
    $sess = $_SESSION;
    session_start();
    $_SESSION = $sess;
}

$_SESSION["DB_NAMES"] = [
    "CORE" => $_ENV["CORE_DB_NAME"],
    "INDUSTRY" => $_ENV["INDUSTRY_DB_NAME"],
    "CITY" => $_ENV["CITY_DB_NAME"],
    "SKI" => $_ENV["SKI_DB_NAME"],
];

$_SESSION["IONSMART_DATABASE"] = $_ENV["IONSMART_MYSQL_DATABASE_NAME"];

if (!defined("CONFIG")) {
    $conf = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/core/config.json");
    define("CONFIG", json_decode($conf, true));
}
date_default_timezone_set(CONFIG["time_zone"] ?? "Europe/Madrid");

if (!defined("DATABASE_LOGS_FILE")) {
    define("DATABASE_LOGS_FILE", "{$_SERVER["DOCUMENT_ROOT"]}/core/database.log");
}

if (!defined("FICHERO_LOGS_DEFAULT")) {
    define("FICHERO_LOGS_DEFAULT", "{$_SERVER["DOCUMENT_ROOT"]}/core/errors.log");
}

if (!defined("NX_PROXY")) {
    define("NX_PROXY", CONFIG["nx"]["proxy"]);
}

if (!defined("TIME_ZONE")) {
    define("TIME_ZONE", new DateTimeZone(CONFIG["time_zone"] ?? "Europe/Madrid"));
}

if (!defined("SNAPSHOT_TOKEN")) {
    define("SNAPSHOT_TOKEN", $_ENV["API_KEY_SNAPSHOT"]);
}

if (!defined("MQTT_RECONOCIMIENTOS")) {
    define(
        "MQTT_RECONOCIMIENTOS",
        "traffic/reconocimientos_cambio"
    );
}

if (!defined("MQTT_RECONOCIMIENTOS_PKG")) {
    define(
        "MQTT_RECONOCIMIENTOS_PKG",
        "ski/reconocimientos_cambio"
    );
}

if (!defined("MQTT_ALERTAS")) {
    define(
        "MQTT_ALERTAS",
        "plataforma/nueva_alerta"
    );
}

if (!defined("MQTT_MOVIMIENTOS")) {
    define(
        "MQTT_MOVIMIENTOS",
        "plataforma/movimiento_detectado"
    );
}

if (!defined("MQTT_VIDEOS_SOCKET")) {
    define(
        "MQTT_VIDEOS_SOCKET",
        "plataforma/video_compartido"
    );
}

if (!defined("MQTT_OCUPACION_SOCKET")) {
    define(
        "MQTT_OCUPACION_SOCKET",
        "analysis/nueva_ocupacion"
    );
}

if (!defined("MQTT_ALERTAS_SKI")) {
    define(
        "MQTT_ALERTAS_SKI",
        "ski/alertas_cambio"
    );
}

if (!defined("MQTT_OCUPACION_RESTAURANTE_SOCKET")) {
    define(
        "MQTT_OCUPACION_RESTAURANTE_SOCKET",
        "ski/nueva_ocupacion_restaurante"
    );
}

if (!defined("MQTT_OCUPACION_PARKING_SOCKET")) {
    define(
        "MQTT_OCUPACION_PARKING_SOCKET",
        "ski/nueva_ocupacion_parking"
    );
}

if (!defined("MQTT_TRANSPORTES_SOCKET")) {
    define(
        "MQTT_TRANSPORTES_SOCKET",
        "ski/nueva_persona_transportada"
    );
}

if (!defined("MQTT_PLAZAS_OCUPADAS_LIFT_SOCKET")) {
    define(
        "MQTT_PLAZAS_OCUPADAS_LIFT_SOCKET",
        "ski/plazas_ocupadas_remontadores"
    );
}

if (!defined("MQTT_TIEMPO_ESPERA_LIFT_SOCKET")) {
    define(
        "MQTT_TIEMPO_ESPERA_LIFT_SOCKET",
        "ski/nuevo_tiempo_espera_remontadores"
    );
}

if (!defined("MQTT_TIEMPO_ESPERA_TAQUILLAS_SOCKET")) {
    define(
        "MQTT_TIEMPO_ESPERA_TAQUILLAS_SOCKET",
        "ski/nuevo_tiempo_espera_taquillas"
    );
}

if (!defined("MQTT_ULTIMO_ESTADO_AMBIENTE")) {
    define(
        "MQTT_ULTIMO_ESTADO_AMBIENTE",
        "industry/nuevo_estado_ambiente"
    );
}

if (!defined("MQTT_ULTIMO_ESTADO_DISTANCIA")) {
    define(
        "MQTT_ULTIMO_ESTADO_DISTANCIA",
        "industry/nuevo_estado_distancia"
    );
}

if (!defined("MQTT_ULTIMOS_PICKINGS")) {
    define(
        "MQTT_ULTIMOS_PICKINGS",
        "industry/nuevos_pickings"
    );
}

if (!defined("MQTT_ULTIMAS_LLAMADAS")) {
    define(
        "MQTT_ULTIMAS_LLAMADAS",
        "industry/nuevas_llamadas"
    );
}

if (!defined("MQTT_ULTIMOS_CONSUMOS")) {
    define(
        "MQTT_ULTIMOS_CONSUMOS",
        "industry/nuevos_consumos"
    );
}

if (!defined("MQTT_ACTIVIDAD_MUELLE")) {
    define(
        "MQTT_ACTIVIDAD_MUELLE",
        "industry/actividad_muelle"
    );
}

if (!defined("NODE_RECONOCIMIENTOS_URL")) {
    define(
        "NODE_RECONOCIMIENTOS_URL",
        "{$SOCKET_API_CAMBIOS_URL}/reconocimientos_cambio"
    );
}

if (!defined("NODE_RECONOCIMIENTOS_PKG_URL")) {
    define(
        "NODE_RECONOCIMIENTOS_PKG_URL",
        "{$SOCKET_API_CAMBIOS_URL}/reconocimientospkg_cambio"
    );
}

if (!defined("NODE_ALERTAS_URL")) {
    define(
        "NODE_ALERTAS_URL",
        "{$SOCKET_API_CAMBIOS_URL}/nueva_alerta"
    );
}

if (!defined("NODE_ALERTAS_SKI_URL")) {
    define(
        "NODE_ALERTAS_SKI_URL",
        "{$SOCKET_API_CAMBIOS_URL}/skialertas_cambio"
    );
}

if (!defined("NODE_MOVIMIENTOS_URL")) {
    define(
        "NODE_MOVIMIENTOS_URL",
        "{$SOCKET_API_CAMBIOS_URL}/movimiento_detectado"
    );
}

if (!defined("NODE_VIDEOS_SOCKET_URL")) {
    define(
        "NODE_VIDEOS_SOCKET_URL",
        "{$SOCKET_API_CAMBIOS_URL}/video_compartido"
    );
}

if (!defined("NODE_OCUPACION_SOCKET_URL")) {
    define(
        "NODE_OCUPACION_SOCKET_URL",
        "{$SOCKET_API_CAMBIOS_URL}/nueva_ocupacion"
    );
}

if (!defined("NODE_OCUPACION_RESTAURANTE_SOCKET_URL")) {
    define(
        "NODE_OCUPACION_RESTAURANTE_SOCKET_URL",
        "{$SOCKET_API_CAMBIOS_URL}/nueva_ocupacion_restaurante"
    );
}

if (!defined("NODE_OCUPACION_PARKING_SOCKET_URL")) {
    define(
        "NODE_OCUPACION_PARKING_SOCKET_URL",
        "{$SOCKET_API_CAMBIOS_URL}/nueva_ocupacion_parking"
    );
}

if (!defined("NODE_TRANSPORTES_SOCKET_URL")) {
    define(
        "NODE_TRANSPORTES_SOCKET_URL",
        "{$SOCKET_API_CAMBIOS_URL}/nueva_persona_transportada"
    );
}

if (!defined("NODE_PLAZAS_OCUPADAS_LIFT_SOCKET_URL")) {
    define(
        "NODE_PLAZAS_OCUPADAS_LIFT_SOCKET_URL",
        "{$SOCKET_API_CAMBIOS_URL}/plazas_ocupadas_remontadores"
    );
}

if (!defined("NODE_TIEMPO_ESPERA_LIFT_SOCKET_URL")) {
    define(
        "NODE_TIEMPO_ESPERA_LIFT_SOCKET_URL",
        "{$SOCKET_API_CAMBIOS_URL}/nuevo_tiempo_espera_remontadores"
    );
}

if (!defined("NODE_TIEMPO_ESPERA_TAQUILLAS_SOCKET_URL")) {
    define(
        "NODE_TIEMPO_ESPERA_TAQUILLAS_SOCKET_URL",
        "{$SOCKET_API_CAMBIOS_URL}/nuevo_tiempo_espera_taquillas"
    );
}

if (!defined("NODE_ULTIMO_ESTADO_AMBIENTE")) {
    define(
        "NODE_ULTIMO_ESTADO_AMBIENTE",
        "{$SOCKET_API_CAMBIOS_URL}/nuevo_estado_ambiente"
    );
}

if (!defined("NODE_ULTIMO_ESTADO_DISTANCIA")) {
    define(
        "NODE_ULTIMO_ESTADO_DISTANCIA",
        "{$SOCKET_API_CAMBIOS_URL}/nuevo_estado_distancia"
    );
}

if (!defined("NODE_ULTIMOS_PICKINGS")) {
    define(
        "NODE_ULTIMOS_PICKINGS",
        "{$SOCKET_API_CAMBIOS_URL}/nuevos_pickings"
    );
}

if (!defined("NODE_ULTIMAS_LLAMADAS")) {
    define(
        "NODE_ULTIMAS_LLAMADAS",
        "{$SOCKET_API_CAMBIOS_URL}/nuevas_llamadas"
    );
}

if (!defined("NODE_ULTIMOS_CONSUMOS")) {
    define(
        "NODE_ULTIMOS_CONSUMOS",
        "{$SOCKET_API_CAMBIOS_URL}/nuevos_consumos"
    );
}

if (!defined("NODE_GUARDAR_VIDEOS_URL")) {
    define(
        "NODE_GUARDAR_VIDEOS_URL",
        "{$API_S3_URL}/guardar_fichero"
    );
}

if (!defined("NODE_FRAGMENTAR_VIDEOS_URL")) {
    define(
        "NODE_FRAGMENTAR_VIDEOS_URL",
        "{$API_S3_URL}/download_segment"
    );
}

function boolEnv($field): bool
{
    $b = strtolower($_ENV[$field]) ?? null;

    return match ($b) {
        "true" => true,
        "false" => false,
        default => false,
    };
}

if (!defined("DEBUG")) {
    define("DEBUG", boolEnv("DEBUG") ?? false);
}

if (!defined("ESTADOS_LICENCIA")) {
    define("ESTADOS_LICENCIA", [
        "ESTADO_LICENCIA_ELIMINADA" => "ELIMINADA",
        "ESTADO_LICENCIA_VALIDA" => "VALIDA",
        "ESTADO_LICENCIA_ENUSO" => "EN USO",
        "ESTADO_LICENCIA_PRORROGA" => "PRORROGA",
        "ESTADO_LICENCIA_EXPIRADA" => "EXPIRADA"
    ]);
}

if (!defined("ESTADOS_CANALES")) {
    define("ESTADOS_CANALES", [
        "ESTADO_ACTIVO" => "activo",
        "ESTADO_PRORROGA" => "prorroga",
        "ESTADO_CADUCADO" => "caducado",
    ]);
}

if (!defined("CAMPAIGN_ESTADOS")) {
    define("CAMPAIGN_ESTADOS", [
        "ESTADO_CURSO" => "En curso",
        "ESTADO_PROCESANDO" => "Procesando",
        "ESTADO_FINAL" => "Finalizada",
    ]);
}

if (!defined("API_KEY_MAPS")) {
    define("API_KEY_MAPS", $_ENV["API_KEY_MAPS"] ?? null);
}

if (!defined("DELETE_IMG")) {
    define("DELETE_IMG", "ELIMINAR");
}

if (!defined("DELETE_FIELD")) {
    define("DELETE_FIELD", "ELIMINAR");
}

if (!defined("TIPOS_MENSAJES_UPLINK")) {
    define("TIPOS_MENSAJES_UPLINK", ["confirmed", "unconfirmed"]);
}

if (!defined("MODOS_OPERACIONALES_SENSOR")) {
    define("MODOS_OPERACIONALES_SENSOR", [0, 1, 2]);
}

if (!defined("TIPO_SENSOR_RADIADOR")) {
    define("TIPO_SENSOR_RADIADOR", "RADIADOR");
}

require_once $_SERVER["DOCUMENT_ROOT"] . "/core/database.php";

if (!defined("DATABASE")) {
    define("DATABASE", new BaseDatos());
}

if (!defined("MODULOS")) {
    $obtenerModulosFormat = function () {
        $modulos = [];

        $modulosBD = obtenerModulosParam() ?? [];
        foreach ($modulosBD as $mod) {
            $moduloExp = [
                "cod_modulo" => $mod->cod_modulo,
                "nombre_modulo" => $mod->nombre_modulo,
                "cod_sector" => $mod->cod_sector,
            ];

            $modulos[$mod->nombre_modulo] = $moduloExp;
            $modulos["{$mod->cod_modulo}"] = $moduloExp;
        }
        return $modulos;
    };

    define("MODULOS", $obtenerModulosFormat());
}

require_once $_SERVER["DOCUMENT_ROOT"] . "/core/verificarToken/verificarToken.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/mqtt.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/socket.php";

function file_force_contents($fullPath, $contents, $flags = 0)
{
    $parts = explode("/", $fullPath);
    array_pop($parts);
    $dir = implode("/", $parts);

    if (!is_dir($dir))
        mkdir($dir, 0777, true);

    file_put_contents($fullPath, $contents, $flags);
}

function llamadaCurl($URL, $postFields = null, $headers = [], $decode = true)
{
    try {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $URL);
        curl_setopt($ch, CURLOPT_POST, $postFields ? 1 : 0);
        if ($postFields)
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postFields));
        if (is_array($headers)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        } else if (is_string($headers)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, [$headers]);
        }
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 0);
        if ($decode !== true) {
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 60);  // Tiempo de espera para la conexión
            curl_setopt($ch, CURLOPT_BUFFERSIZE, 128000);  // Tamaño del buffer en bytes
            curl_setopt($ch, CURLOPT_ENCODING, "");
        }

        $response = curl_exec($ch);
        // Manejar errores si los hubiera
        if (curl_errno($ch)) {
            return ["error" => "Error cURL: " . curl_error($ch)];
        }

        curl_close($ch);
        if ($decode === true)
            $response = json_decode($response, true);

        return [
            "response" => $response,
            "headers" => curl_getinfo($ch)
        ];
    } catch (Exception) {
        return false;
    }
}

function acabarRequest($returnObj, $status = 200, $clean = true)
{
    if ($clean && !DEBUG) {
        ob_clean();
    }

    header("Content-type: application/json", true);
    http_response_code($status);
    echo json_encode($returnObj, JSON_PRETTY_PRINT);
    exit();
}

function acabarRequestSinSalir($returnObj, $status = 200)
{
    ob_clean();
    header("Content-type: application/json", true);
    http_response_code($status);
    echo json_encode($returnObj, JSON_PRETTY_PRINT);

    if (function_exists("session_write_close")) {
        session_write_close();

        if (function_exists("fastcgi_finish_request")) {
            fastcgi_finish_request();
        }
    }
}

function isValidDateTime($date)
{
    return (strtotime($date) !== false);
}

function esCorreoValido($email)
{
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function sendHeaders(array $headers)
{
    foreach ($headers as $header) {
        header($header);
    }
}

function EscribirLog($mensaje, $tipo_mensaje = "normal")
{
    if (!(
        DEBUG === true ||
        $tipo_mensaje == "error"
    )) {
        return;
    }

    error_log($mensaje, 0);
}

function EscribirLogEspecifico($fichero, $mensaje, $tipo_mensaje = "normal")
{
    if (!(DEBUG === true || $tipo_mensaje == "error")) return;

    if ($gestor = fopen($fichero, "a")) {
        // Escribe el contenido en el archivo
        fwrite($gestor, "[" . date("Y-m-d H:i:s", time()) . "] $mensaje");

        // Cierra el archivo
        fclose($gestor);
    }
}

function generarUUID()
{
    // Genera un UUID versión 4 (aleatorio)
    $data = openssl_random_pseudo_bytes(16);
    assert(strlen($data) == 16);
    $data[6] = chr(ord($data[6]) & 0xF | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3F | 0x80);
    return vsprintf("%s%s-%s-%s-%s-%s%s%s", str_split(bin2hex($data), 4));
}

function llamadaMapsApi($url)
{
    try {
        $API_KEY_MAPS = API_KEY_MAPS;

        $arrContextOptions = array(
            "ssl" => array(
                "verify_peer" => false,
                "verify_peer_name" => false,
            ),
        );

        $url .= "&key=" . urlencode($API_KEY_MAPS);

        return json_decode(file_get_contents($url, false, stream_context_create($arrContextOptions)));
    } catch (\Throwable) {
        return null;
    }
}

function validarCoordenadas($coordenadas)
{
    // Expresión regular para comprobar el formato y realizar la sustitución si es necesario
    $patron = "/^([-+]?\d*\.\d+),?\s?([-+]?\d*\.\d+)$/";

    if (preg_match($patron, $coordenadas, $coincidencias)) {
        // Si el formato es correcto, devuelve las coordenadas
        return $coincidencias[1] . "," . $coincidencias[2];
    } else {
        // Si el formato no es correcto, devuelve false o realiza alguna otra acción según tus necesidades
        return false;
    }
}

function obtenerDireccionCoordenadas($coordenadas)
{
    try {
        $url = "https://maps.googleapis.com/maps/api/geocode/json?"
            . "latlng=" . urlencode($coordenadas);

        $json_geocode = llamadaMapsApi($url);

        $location = $json_geocode->results[0]->formatted_address ?? null;
        return $location;
    } catch (Throwable) {
        return null;
    }
}

function obtenerDireccionCompletaCoordenadas($coordenadas)
{
    try {
        $url = "https://maps.googleapis.com/maps/api/geocode/json?"
            . "latlng=" . urlencode($coordenadas);

        $json_geocode = llamadaMapsApi($url);

        $componentes = $json_geocode->results[0]->address_components;

        foreach ($componentes as $comp) {
            if (in_array("locality", $comp->types)) {  // Población
                $poblacion = $comp->long_name;
            } else if (in_array("administrative_area_level_2", $comp->types)) {  // Provincia
                $provincia = $comp->long_name;
            } else if (in_array("administrative_area_level_1", $comp->types)) {  // C. Aut
                $comunidad = $comp->long_name;
            } else if (in_array("country", $comp->types)) {
                $pais = $comp->long_name;
            } else if (in_array("postal_code", $comp->types)) {
                $cp = $comp->long_name;
            }
        }

        $direccion = $json_geocode->results[0]->formatted_address ?? null;

        return [
            "poblacion" => $poblacion ?? "",
            "provincia" => $provincia ?? "",
            "comunidad" => $comunidad ?? "",
            "pais" => $pais ?? "",
            "cp" => $cp ?? "",
            "direccion" => $direccion
        ];
    } catch (Throwable) {
        return null;
    }
}

function obtenerCoordenadasDireccion($direccion)
{
    try {
        $url = "https://maps.googleapis.com/maps/api/geocode/json?address="
            . urlencode($direccion);

        $json_geocode = llamadaMapsApi($url);

        $componentes = $json_geocode->results[0]->address_components;

        foreach ($componentes as $comp) {
            if (in_array("locality", $comp->types)) {  // Población
                $poblacion = $comp->long_name;
            } else if (in_array("administrative_area_level_2", $comp->types)) {  // Provincia
                $provincia = $comp->long_name;
            } else if (in_array("administrative_area_level_1", $comp->types)) {  // C. Aut
                $comunidad = $comp->long_name;
            } else if (in_array("country", $comp->types)) {
                $pais = $comp->long_name;
            } else if (in_array("postal_code", $comp->types)) {
                $cp = $comp->long_name;
            }
        }

        $direccion = $json_geocode->results[0]->formatted_address ?? $direccion;

        $coordenadas = $json_geocode->results[0]->geometry->location ?? null;
        if ($coordenadas != null) {
            $coordenadas = "{$coordenadas->lat},{$coordenadas->lng}";
        }

        return [
            "poblacion" => $poblacion ?? "",
            "provincia" => $provincia ?? "",
            "comunidad" => $comunidad ?? "",
            "pais" => $pais ?? "",
            "cp" => $cp ?? "",
            "direccion" => $direccion ?? "",
            "coordenadas" => $coordenadas ?? ""
        ];
    } catch (\Throwable) {
        return null;
    }
}

function obtenerModulosParam(
    $nombre_modulo = null,
    $cod_sector = null,
    $cod_modulo = null,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT 
			m.*
		FROM {{.CORE}}.modulos m 
		WHERE 1 ";

    if ($nombre_modulo != null) {
        $sql .= "AND m.nombre_modulo LIKE ? ";
        $values[] = "%$nombre_modulo%";
    }

    if ($cod_sector != null) {
        $sql .= "AND m.cod_sector = ? ";
        $values[] = $cod_sector;
    }

    if ($cod_modulo != null) {
        $sql .= "AND m.cod_modulo = ? ";
        $values[] = $cod_modulo;
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerSeccionesParam(
    $cod_modulo = null,
    $cod_seccion = null,
    $nombre_seccion = null,
    $cod_sector = null,
    $cod_sector_unico = null,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT 
			ms.*
		FROM {{.CORE}}.modulos_seccion ms 
        LEFT JOIN 
            {{.CORE}}.modulos m 
                ON m.cod_modulo = ms.cod_modulo
        LEFT JOIN 
            {{.CORE}}.sectores_verticales sv 
                ON m.cod_sector = sv.cod_sector
		WHERE 1 ";

    if ($nombre_seccion != null) {
        $sql .= "AND ms.nombre_seccion LIKE ? ";
        $values[] = "%$nombre_seccion%";
    }

    if ($cod_modulo != null) {
        $sql .= "AND ms.cod_modulo = ? ";
        $values[] = $cod_modulo;
    }

    if ($cod_sector != null) {
        $sql .= "AND sv.cod_sector = ? ";
        $values[] = $cod_sector;
    }

    if ($cod_sector_unico != null) {
        $sql .= "AND (ms.cod_sector_unico = ? OR ms.cod_sector_unico IS NULL) ";
        $values[] = $cod_sector_unico;
    }

    if ($cod_seccion != null) {
        $sql .= "AND ms.cod_seccion = ? ";
        $values[] = $cod_seccion;
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerDiferenciaSegundos($datetime1, $datetime2)
{
    try {
        $intervalo = $datetime1->diff($datetime2);
        $segundos = $intervalo->s +
            $intervalo->i * 60 +
            $intervalo->h * 3_600 +
            $intervalo->days * 86_400;
    } catch (Exception) {
        return 0;
    }
    return $segundos;
}

function obtenerTimestampFecha($fecha)
{
    $timestamp = null;
    try {
        $fechahora = new DateTime($fecha);
        $timestamp = date_timestamp_get($fechahora);
    } catch (Exception) {
        return null;
    } finally {
        return $timestamp;
    }
}

function GuardarImagenBase64($imagenBase64, $ruta)
{
    if (!isset($imagenBase64))
        return false;

    $imagenDecoded = base64_decode($imagenBase64);
    return file_put_contents($ruta, $imagenDecoded);
}

function explodeGroupConcat($field, $separator = ",")
{
    if (!is_string($field)) return [];

    return array_values(array_unique(explode(
        $separator,
        $field,
    )));
}

function renderQuery(string $query): string
{
    return renderTemplate($query, $_SESSION["DB_NAMES"] ?? []);
}

/**
 * @param string $template: Las sustituciones son cadenas rodeadas por {}, ex: {{.KEY}}
 * @param array<string> $map: Sustituciones definidas, por ejemplo ["KEY" => "ejemplo"]
 */
function renderTemplate(string $template, array $map): string
{
    // Construimos el mapa "{{.KEY}}" => "valor"
    $replacements = [];
    foreach ($map as $k => $v) {
        $replacements["{{.$k}}"] = (string)$v;
    }
    return strtr($template, $replacements);
}

function comprobarAreaCoordenadas(
    $point,
    $fenceArea,
) {
    $x = $point['lat'];
    $y = $point['lng'];

    $inside = false;
    for ($i = 0, $j = count($fenceArea) - 1; $i < count($fenceArea); $j = $i++) {
        $xi = $fenceArea[$i]['lat'];
        $yi = $fenceArea[$i]['lng'];
        $xj = $fenceArea[$j]['lat'];
        $yj = $fenceArea[$j]['lng'];

        $intersect = (($yi > $y) != ($yj > $y)) &&
            ($x < ($xj - $xi) * ($y - $yi) / ($yj - $yi) + $xi);
        if ($intersect)
            $inside = !$inside;
    }

    return $inside;
}
