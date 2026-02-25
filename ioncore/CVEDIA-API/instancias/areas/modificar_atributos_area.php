<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Area;
use Funciones\Instancia;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;
$areaId = $jsonobj2->areaId ?? null;
$attribute_restrictions = $jsonobj2->attribute_restrictions ?? null;

if (!(
    $instanceId
    && $areaId
    && $attribute_restrictions
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

$update = $i->update_zone_attributes($instanceId, $areaId, $attribute_restrictions, "area");

Utils::acabarRequest($update);
