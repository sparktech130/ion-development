<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use CVUtils\Utils;
use Funciones\Core;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);
$err = [
    "message" => "No se ha recibido un cloud válido", 
    "error" => true,
];
$cod_cloud_analysis = $jsonobj2->cod_cloud_analysis ?? null;

$clouds = obtenerCloudsAnalysis(cod_cloud: $cod_cloud_analysis, activo: true);
if (!(
    is_array($clouds) &&
        !empty($clouds)
)) {
    Utils::acabarRequest($err);
}

$canales = [
    "features" => [
        "lpr" => 0,
        "streams" => 0,
    ]
];

foreach ($clouds as $cl) {
    $analysis_url = Utils::obtenerServer($cl->ip, $cl->puerto);

    $c = new Core($analysis_url);
    $lic = $c->license_features();
    $lpr = $lic["features"]["license_plate_analytics"] ?? [];
    $streams = $lic["features"]["streams"] ?? [];

    $canales["features"]["lpr"] += $lpr["allowance"] ?? 0;
    $canales["features"]["streams"] += $streams["allowance"] ?? 0;
}

acabarRequest($canales);
