<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/cloud_nx/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$nombre = $jsonobj2->nombre ?? null;
$systemId = $jsonobj2->systemId ?? null;
$user = $jsonobj2->user ?? null;
$password = $jsonobj2->password ?? null;
$cloud_user = $jsonobj2->cloud_user ?? null;
$cloud_password = $jsonobj2->cloud_password ?? null;
$cod_sector = $jsonobj2->cod_sector ?? null;
$getDevices = $jsonobj2->getDevices ?? false;

$cod_cloud = insertarCloudNx(
    $nombre,
    $systemId,
    $user,
    $password,
    $cloud_user,
    $cloud_password,
    $cod_sector
);

if (
    $cod_cloud === false ||
    isset($cod_cloud["error"])
) {
    $insertReturn = false;
    acabarRequest($insertReturn, 500);
}

enviarActualizacionCloudsNx("updates", $cod_cloud);

if (!$getDevices) {
    acabarRequestSinSalir($cod_cloud);
}

$cloud = obtenerCloudsParam($cod_cloud);
guardarStreamAuthKeys($cloud);

acabarRequest([
    "cod_cloud" => $cod_cloud,
    "dispositivos" => obtenerDispositivosSincronizar(),
]);
