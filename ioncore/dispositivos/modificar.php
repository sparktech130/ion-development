<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;

$nom_dispositivo = $jsonobj2->nom_dispositivo ?? null;
$cod_cloud = $jsonobj2->cod_cloud ?? null;
$cod_modelo = $jsonobj2->cod_modelo ?? null;
$ip_dispositivo = $jsonobj2->ip_dispositivo ?? null;
$direccion = $jsonobj2->direccion ?? null;
$coordenadas = $jsonobj2->coordenadas ?? null;
$cod_provincia = $jsonobj2->cod_provincia ?? null;
$cod_poblacion = $jsonobj2->cod_poblacion ?? null;
$cp = $jsonobj2->cp ?? null;
$cod_nodo = $jsonobj2->cod_nodo ?? null;

$cod_nodo = $jsonobj2->cod_nodo ?? null;
$serial_number = $jsonobj2->serial_number ?? null; # varchar 20
$protocolo_ip = $jsonobj2->protocolo_ip ?? null; # varchar 20
$puerta_enlace = $jsonobj2->puerta_enlace ?? null; # varchar 20
$mascara_red = $jsonobj2->mascara_red ?? null; # varchar 20
$direccion_mac = $jsonobj2->direccion_mac ?? null; # varchar 40
$servidor_dhcp = $jsonobj2->servidor_dhcp ?? null; # varchar 2

$modulos = $jsonobj2->modulos ?? null;

$deveui = $jsonobj2->deveui ?? null;
$appeui = $jsonobj2->appeui ?? null;
$appkey = $jsonobj2->appkey ?? null;
$joineui = $jsonobj2->joineui ?? null;
$username = $jsonobj2->username ?? null;
$password = $jsonobj2->password ?? null;

$deviceIdUpdate = $jsonobj2->deviceIdUpdate ?? null;

$returnObj = [];

if ($direccion == null && $coordenadas != null) {
    $coordenadas = validarCoordenadas($coordenadas);
    if ($coordenadas !== false) {
        $direccion = obtenerDireccionCoordenadas($coordenadas);
    } else {
        $coordenadas = null;
    }
}

if ($cod_dispositivo == null) {
    acabarRequest([
        "message" => "Dispositivo no recibido",
        "error" => true
    ], 500);
}

$dispositivo = obtenerDispositivos(cod_dispositivo: $cod_dispositivo);
if ($dispositivo == null || isset($dispositivo["error"]) || count($dispositivo) > 1) {
    acabarRequest([
        "message" => "Dispositivo inválido",
        "error" => true
    ]);
}

$dispositivo = $dispositivo[0];

if (isset($cod_modelo) && (int)$cod_modelo != $dispositivo->cod_modelo) {
    $modelos = obtenerModelosParam($cod_modelo, null, null, null, null);
    if ($modelos == null || isset($modelos["error"]) || count($modelos) > 1) {
        acabarRequest([
            "message" => "Modelo inválido",
            "error" => true
        ]);
    }
}

$returnObj = modificarDispositivos(
    cod_dispositivo: $cod_dispositivo,
    nom_dispositivo: $nom_dispositivo,
    direccion: $direccion,
    cp: $cp,
    coordenadas: $coordenadas,
    cod_provincia: $cod_provincia,
    cod_poblacion: $cod_poblacion,
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
    modulos: $modulos,
    deviceId: $deviceIdUpdate,
    cod_cloud: $cod_cloud
);
enviarActualizacionDispositivos("updates", $cod_dispositivo);

if (
    !isset($_SESSION["ENDIT"]) ||
    $_SESSION["ENDIT"] === true
) {
    acabarRequest($returnObj);
}
