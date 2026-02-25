<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Instancia;
use Funciones\Line;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;

if (!$instanceId) {
    Utils::acabarRequest([]);
}

$clouds = obtenerCloudsAnalysis(null, $instanceId);
if (!(
    is_array($clouds) &&
        !empty($clouds) &&
        count($clouds) == 1 &&
        !isset($clouds["error"]) 
)){
    Utils::acabarRequest([]);
}

$c = $clouds[0];
$i = new Instancia(Utils::obtenerServer($c->ip, $c->puerto));
$l = new Line($i);

$dbZones = obtenerZonasDeteccion(instanceId: $instanceId);
if (!(
    is_array($dbZones) &&
        !empty($dbZones) &&
        !isset($dbZones["error"]) 
)) {
    Utils::acabarRequest($dbZones);
}
$ag = [];
foreach ($dbZones as $a) {
    if (!isset($a->zoneId)) continue;
    $ag[$a->zoneId] = $a;
}

$lines = $l->obtener_lines_full(
    instanceId: $instanceId,
    dbZones: $ag,
);

Utils::acabarRequest(
    $lines,
);
