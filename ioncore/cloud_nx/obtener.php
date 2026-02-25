<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/cloud_nx/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_cloud = $jsonobj2->cod_cloud ?? null;
$nombre = $jsonobj2->nombre ?? null;
$systemId = $jsonobj2->systemId ?? null;
$user = $jsonobj2->user ?? null;
$cloud_user = $jsonobj2->cloud_user ?? null;
$cod_sector = $jsonobj2->cod_sector ?? null;

$clouds = obtenerCloudsParam($cod_cloud, $nombre, $systemId, $user, $cloud_user, $permisos_usuario, $cod_sector);

if (!isset($clouds["error"]) && !empty($clouds)){
    foreach ($clouds as $cl) {
        $cl->password = "*****";
        $cl->cloud_password = "*****";
    }
}

acabarRequest($clouds);
