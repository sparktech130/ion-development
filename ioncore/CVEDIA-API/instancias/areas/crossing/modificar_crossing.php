<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Area;
use Funciones\Instancia;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;
$attribute_restrictions = $jsonobj2->attribute_restrictions ?? null;
$areaId = $jsonobj2->areaId ?? null;
$name = $jsonobj2->name ?? null;
$coordinates = $jsonobj2->coordinates ?? [];
$classes = $jsonobj2->classes ?? ["Person"]; // [Person, Animal, Vehicle, Face, Unknown]
$ignoreStationaryObjects = $jsonobj2->ignoreStationaryObjects ?? false;
$areaEvent = $jsonobj2->areaEvent ?? "Both"; // Enter, Exit, Both

$ion_zone_type = $jsonobj2->ion_zone_type ?? null;
$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$cod_infraccion = $jsonobj2->cod_infraccion ?? null;
$areaType = "crossing";
$analisis = obtenerAnalisis($areaType);
if (!(
    is_array($analisis) &&
        !empty($analisis) &&
        count($analisis) == 1 &&
        !isset($analisis["error"]) 
)) {
    Utils::acabarRequest([]);
}
$cod_ai = $analisis[0]->cod_ai;

$color = $jsonobj2->color ?? [
    0,
    0,
    1,
    0.3
];

if (!(
    $instanceId
        && $areaId
        && ($coordinates || $classes || $areaEvent || $color ||$name || $attribute_restrictions)
)) {
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
$a = new Area($i);

$areas = $a->obtener_areas($instanceId) ?? [];

$existeArea = function () use ($areas, $areaId) {
    foreach ($areas as $areaType) {
        foreach ($areaType as $area) {
            if (isset($area["id"]) && $area["id"] == $areaId)
            return $area;
        }
    }

    return false;
};

// Comprobamos si existe el área recibida
$area = $existeArea();
if (!$area)
Utils::acabarRequest(["message" => "El área no existe"]);

// Eliminamos el área
$a->delete_area(
    $instanceId,
    $areaId
);

$arrayHasFace = array_search("Face", $classes);
if ($arrayHasFace !== false) {
    unset($classes[$arrayHasFace]);
    $addFace = true;
}

$postData = [
    "name" => $name,
    "coordinates" => $coordinates,
    "classes" => $classes,
    "ignoreStationaryObjects" => $ignoreStationaryObjects,
    "areaEvent" => $areaEvent,
    "color" => $color
];

$update = $a->area(
    "PUT",
    "crossing",
    $instanceId,
    $areaId,
    $postData
);

if ($update !== true) {
    $postData["name"] = $area["name"];
    $postData["coordinates"] = $area["coordinates"];
    $postData["classes"] = $area["classes"] ?? null;
    $postData["ignoreStationaryObjects"] = $area["ignoreStationaryObjects"] ?? null;
    $postData["areaEvent"] = $area["areaEvent"] ?? null;
    $postData["color"] = $area["color"];

    $update = $a->area(
        "PUT",
        "crossing",
        $instanceId,
        $areaId,
        $postData
    );
}


if ($ion_zone_type != null) {
    $i->setCodInfraccion($instanceId, $areaId, "area", $cod_infraccion);
    $i->setIonZoneType($instanceId, $areaId, "area", $ion_zone_type);
    modificarZonaDeteccion(
        $areaId,
        $instanceId,
        $ion_zone_type,
        $cod_ai,
        "securt",
        $cod_infraccion
    );
}

$i->setIonAreaType($instanceId, $areaId, $areaType);

if (isset($addFace) && $addFace === true){
    $i->setFaceClass($instanceId, $areaId, "area");
} 

$i->update_zone_attributes($instanceId, $areaId, $attribute_restrictions, "area");

$i->instance_restart($instanceId);

Utils::acabarRequest($update);
