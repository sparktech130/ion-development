<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Area;
use Funciones\Instancia;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;
$areaId = $jsonobj2->areaId ?? null;
$name = $jsonobj2->name ?? null;
$coordinates = $jsonobj2->coordinates ?? [];
$color = $jsonobj2->color ?? [
    0,
    0,
    1,
    0.3
];
$ion_zone_type = $jsonobj2->ion_zone_type ?? null;
$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$cod_infraccion = $jsonobj2->cod_infraccion ?? null;
$areaType = "fallen_person";
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
$a = new Area($i);

$postData = [
    "name" => $name,
    "coordinates" => $coordinates,
    "color" => $color
];

$insert = $a->area(
    "POST",
    $areaType,
    $instanceId,
    $areaId,
    $postData
);

if ($insert !== false) {
    $areaId = $insert["areaId"];
    $i->setIonAreaType($instanceId, $areaId, $areaType);
    $i->setCodInfraccion($instanceId, $areaId, "area", $cod_infraccion);
    $i->setIonZoneType($instanceId, $areaId, "area", $ion_zone_type);

    insertarZonaDeteccion(
        $areaId,
        $instanceId,
        $ion_zone_type,
        $cod_ai,
        "securt",
        $cod_infraccion,
    );

    $i->instance_restart($instanceId);
}

Utils::acabarRequest($insert);
