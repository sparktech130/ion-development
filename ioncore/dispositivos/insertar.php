<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";

use Funciones\NxConnection;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$nom_dispositivo = $jsonobj2->nom_dispositivo ?? null;
$ip_dispositivo = $jsonobj2->ip_dispositivo ?? null;
$direccion = $jsonobj2->direccion ?? null;
$coordenadas = $jsonobj2->coordenadas ?? null;
$cod_provincia = $jsonobj2->cod_provincia ?? null;
$cod_poblacion = $jsonobj2->cod_poblacion ?? null;
$cp = $jsonobj2->cp ?? null;
$cod_modelo = $jsonobj2->cod_modelo ?? null;

$cod_nodo = $jsonobj2->cod_nodo ?? null;
$serial_number = $jsonobj2->serial_number ?? null;
$protocolo_ip = $jsonobj2->protocolo_ip ?? null;
$puerta_enlace = $jsonobj2->puerta_enlace ?? null;
$mascara_red = $jsonobj2->mascara_red ?? null;
$direccion_mac = $jsonobj2->direccion_mac ?? null;
$servidor_dhcp = $jsonobj2->servidor_dhcp ?? null;

$modulos = $jsonobj2->modulos ?? null;

$deveui = $jsonobj2->deveui ?? null;
$appeui = $jsonobj2->appeui ?? null;
$appkey = $jsonobj2->appkey ?? null;
$joineui = $jsonobj2->joineui ?? null;
$deviceId = $jsonobj2->deviceId ?? null;

$username = $jsonobj2->username ?? null;
$password = $jsonobj2->password ?? null;

if ($direccion == null && $coordenadas != null) {
    $coordenadas = validarCoordenadas($coordenadas);
    if ($coordenadas !== false) {
        $direccion = obtenerDireccionCoordenadas($coordenadas);
    }
}

if ($coordenadas === false) {
    acabarRequest([
        "message" => "Coordenadas inválidas",
        "error" => true
    ], 500);
}

// Datos para Nx
$cod_cloud = $jsonobj2->cod_cloud ?? null;
if ($cod_cloud != null) {
    $cloud = obtenerCloudsParam($cod_cloud);
}

if (!isset($modelos)) {
    $modelos = obtenerModelosParam($cod_modelo);
    if ($modelos == null || isset($modelos["error"]) || count($modelos) > 1) {
        acabarRequest([
            "message" => "Modelo inválido",
            "error" => true
        ]);
    }
}

$cod_categoria = $modelos[0]->cod_categoria ?? 0;
if (!in_array(
    (int)$cod_categoria,
    CATEGORIAS_DISPOSITIVOS,
)) {
    acabarRequest([
        "message" => "Modelo no encontrado",
        "error" => true
    ]);
}

if (
    in_array(
        (int)$cod_categoria,
        [
            CATEGORIAS_DISPOSITIVOS["SENSOR_AMBIENTE"],
            CATEGORIAS_DISPOSITIVOS["SENSOR_ALMACENAJE"],
            CATEGORIAS_DISPOSITIVOS["SENSOR_ACCESO"],
        ],
    )
) {
    $returnObj = insertarDispositivos(
        nom_dispositivo: $nom_dispositivo,
        direccion: $direccion,
        coordenadas: $coordenadas,
        cod_provincia: $cod_provincia,
        cod_poblacion: $cod_poblacion,
        cp: $cp,
        serial_number: $serial_number,
        cod_modelo: $cod_modelo,
        cod_nodo: $cod_nodo,
        puerta_enlace: $puerta_enlace,
        servidor_dhcp: $servidor_dhcp,
        mascara_red: $mascara_red,
        protocolo_ip: $protocolo_ip,
        ip_dispositivo: $ip_dispositivo,
        direccion_mac: $direccion_mac,
        deveui: $deveui,
        appeui: $appeui,
        appkey: $appkey,
        joineui: $joineui,
        username: $username,
        password: $password,
        deviceId: $deveui,
        modulos: $modulos,
    );
} elseif (
    in_array(
        (int)$cod_categoria,
        [
            CATEGORIAS_DISPOSITIVOS["CAMARA"],
            CATEGORIAS_DISPOSITIVOS["MONITOR"]
        ],
    ) &&
    isset($cloud) &&
    !isset($cloud["error"]) &&
    !empty($cloud)
) {
    $cloud = $cloud[0];

    $systemId = $cloud->systemId;
    $user = $cloud->user;
    $password = $cloud->password;
    $ip = $cloud->ip ?? null;
    $puerto = $cloud->puerto ?? null;

    $nx = new NxConnection(
        $systemId,
        $ip,
        $puerto,
        $user,
        $password,
    );

    $dispositivoNx = $nx->getDevice($deviceId, null);
    if (!isset($dispositivoNx->id)) {
        acabarRequest([
            "message" => "Dispositivo no encontrado",
            "error" => true,
        ], 500);
    }

    $serverId = $dispositivoNx->serverId;

    $serverId = trim($dispositivoNx->serverId, "{} ");
    $serverUrl = $nx->getServerUrl($serverId);

    $returnObj = insertarDispositivos(
        nom_dispositivo: $nom_dispositivo,
        direccion: $direccion,
        coordenadas: $coordenadas,
        cod_provincia: $cod_provincia,
        cod_poblacion: $cod_poblacion,
        cp: $cp,
        serial_number: $serial_number,
        cod_modelo: $cod_modelo,
        cod_nodo: $cod_nodo,
        ip_dispositivo: $ip_dispositivo,
        direccion_mac: $direccion_mac,
        modulos: $modulos,
        cod_cloud: $cod_cloud,
        deviceId: $deviceId,
        streamUrl: $serverUrl,
    );
} elseif ((int)$cod_categoria == CATEGORIAS_DISPOSITIVOS["MAQUINA"]) {
    $returnObj = insertarDispositivos(
        nom_dispositivo: $nom_dispositivo,
        direccion: $direccion,
        coordenadas: $coordenadas,
        cod_provincia: $cod_provincia,
        cod_poblacion: $cod_poblacion,
        cp: $cp,
        cod_modelo: $cod_modelo,
        ip_dispositivo: $ip_dispositivo,
        direccion_mac: $direccion_mac,
        modulos: $modulos,
        deviceId: $deviceId
    );
} elseif ((int)$cod_categoria == CATEGORIAS_DISPOSITIVOS["TELEFONO"]) {
    $returnObj = insertarDispositivos(
        nom_dispositivo: $nom_dispositivo,
        cod_provincia: $cod_provincia,
        cod_poblacion: $cod_poblacion,
        cp: $cp,
        cod_modelo: $cod_modelo,
        modulos: $modulos,
        deviceId: $deviceId
    );
}

if ($returnObj["insert"] === false) {
    acabarRequest($returnObj);
}

enviarActualizacionDispositivos("updates", $returnObj["cod_dispositivo"]);

if (
    !isset($_SESSION["ENDIT"]) ||
    $_SESSION["ENDIT"] === true
) {
    acabarRequest($returnObj);
}

$_SESSION["dispositivo_insertado"] = [
    "cod_dispositivo" => $returnObj["cod_dispositivo"],
    "modulos" => array_map(
        array: $returnObj["modulos"]["modulosCorrectos"],
        callback: function ($mod) {
            return MODULOS[$mod]["cod_modulo"];
        }
    ),
];
