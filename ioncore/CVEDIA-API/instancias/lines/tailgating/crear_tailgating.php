<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Instancia;
use Funciones\Line;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;
$lineId = $jsonobj2->lineId ?? null;
$name = $jsonobj2->name ?? "";
$coordinates = $jsonobj2->coordinates ?? [];
$classes = $jsonobj2->classes ?? []; // Person, Animal, Vehicle, Face, Unknown
$seconds = $jsonobj2->seconds ?? null;
$direction = $jsonobj2->direction ?? ""; // Up, Down, Both
$color = $jsonobj2->color ?? [];
$ion_zone_type = $jsonobj2->ion_zone_type ?? null;
$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$cod_infraccion = $jsonobj2->cod_infraccion ?? null;
$lineType = "tailgating";
$analisis = obtenerAnalisis("line_{$lineType}");
if (!(
    is_array($analisis) &&
        !empty($analisis) &&
        count($analisis) == 1 &&
        !isset($analisis["error"]) 
)) {
    Utils::acabarRequest([]);
}
$cod_ai = $analisis[0]->cod_ai;

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

$arrayHasFace = array_search("Face", $classes);
if ($arrayHasFace !== false) {
    unset($classes[$arrayHasFace]);
    $addFace = true;
}

$postData = [
    "name" => $name,
    "coordinates" => $coordinates,
    "classes" => $classes,
    "seconds" => $seconds,
    "direction" => $direction,
    "color" => $color
];

$insert = $l->line(
    "POST",
    $lineType,
    $instanceId,
    $lineId,
    $postData
);

if ($insert !== false) {
    $lineId = $insert["lineId"];
    $i->setIonLineType($instanceId, $lineId, "line_{$lineType}");
    $i->setCodInfraccion($instanceId, $lineId, "line", $cod_infraccion);
    $i->setIonZoneType($instanceId, $lineId, "line", $ion_zone_type);

    if (isset($addFace) && $addFace === true) {
        $i->setFaceClass($instanceId, $lineId, "line");
    }

    insertarZonaDeteccion(
        $lineId,
        $instanceId,
        $ion_zone_type,
        $cod_ai,
        "securt",
        $cod_infraccion,
    );

    $i->instance_restart($instanceId);
}

Utils::acabarRequest($insert);
