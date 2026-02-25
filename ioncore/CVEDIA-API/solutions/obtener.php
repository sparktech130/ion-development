<?php
include_once $_SERVER['DOCUMENT_ROOT'] . "/CVEDIA-API/header.php";

use Funciones\Core;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$err = [
    "message" => "No se ha recibido un cloud válido", 
    "error" => true,
];

$cod_cloud_analysis = $jsonobj2->cod_cloud_analysis ?? null;

if (!$cod_cloud_analysis) {
    Utils::acabarRequest($err);
}

$cloud = obtenerCloudsAnalysis($cod_cloud_analysis);
if (!(
    is_array($cloud) &&
        !empty($cloud) &&
        count($cloud) == 1
)) {
    Utils::acabarRequest($err);
}
$cloud = $cloud[0];

$analysis_url = Utils::obtenerServer($cloud->ip, $cloud->puerto);

$c = new Core($analysis_url);
Utils::acabarRequest($c->solutions("GET"));
