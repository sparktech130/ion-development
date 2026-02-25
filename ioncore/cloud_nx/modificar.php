<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/cloud_nx/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_cloud = $jsonobj2->cod_cloud ?? null;
if ($cod_cloud == null) {
    acabarRequest([
        "message" => "Cloud no encontrado",
        "error" => true
    ], 500);
}

$nombre = $jsonobj2->nombre ?? null;
$systemId = $jsonobj2->systemId ?? null;
$user = $jsonobj2->user ?? null;
$password = $jsonobj2->password ?? null;
$cloud_user = $jsonobj2->cloud_user ?? null;
$cloud_password = $jsonobj2->cloud_password ?? null;
$cod_sector = $jsonobj2->cod_sector ?? null;

$modifica = $nombre != null
    || $systemId != null
    || $user != null
    || $password != null
    || $cloud_user != null
    || $cloud_password != null
    || $cod_sector != null;

if (!$modifica) {
    acabarRequest([
        "message" => "No se ha recibido ningún campo a modificar",
        "error" => true
    ], 500);
}

$returnObj = modificarCloudNx(
    $cod_cloud,
    $nombre,
    $systemId,
    $user,
    $password,
    $cloud_user,
    $cloud_password,
    $cod_sector
);

if ($returnObj == false) {
    http_response_code(500);
    acabarRequest($returnObj, 500);
}
enviarActualizacionCloudsNx("updates", $cod_cloud);

$cloud = obtenerCloudsParam($cod_cloud);
guardarStreamAuthKeys($cloud);

acabarRequest($returnObj);
