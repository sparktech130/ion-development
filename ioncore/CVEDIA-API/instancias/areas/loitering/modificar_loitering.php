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
$classes = $jsonobj2->classes ?? []; // [Person, Animal, Vehicle, Face, Unknown]
$seconds = $jsonobj2->seconds ?? 1;
$color = $jsonobj2->color ?? [
    0,
    0,
    1,
    0.3
];
$ion_zone_type = $jsonobj2->ion_zone_type ?? null;
$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$cod_infraccion = $jsonobj2->cod_infraccion ?? null;
$areaType = "loitering";
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

if (!(
    $instanceId
        && $areaId
        && ($coordinates || $seconds || $color || $name ||$classes || $attribute_restrictions)
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

// Ponemos una nueva con el mismo id
$postData = [
    "name" => $name,
    "coordinates" => $coordinates,
    "classes" => $classes,
    "seconds" => (int)$seconds,
    "color" => $color
];

$update = $a->area(
    "PUT",
    $areaType,
    $instanceId,
    $areaId,
    $postData
);

if ($update !== true) {
    $postData["coordinates"] = $area["coordinates"];
    $postData["name"] = $area["name"];
    $postData["color"] = $area["color"];
    $postData["classes"] = $area["classes"] ?? null;
    $postData["seconds"] = $area["seconds"] ?? null;

    $update = $a->area(
        "PUT",
        $areaType,
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
