<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Area;
use Funciones\Instancia;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$solutionType = "crowd-estimation";

$timestamp = time() * 1000;

$instanceId = $jsonobj2->instanceId ?? null;
$name = $jsonobj2->name ?? "Area";
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
$areaType = $solutionType;
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

$instancia = $i->instance("GET", $instanceId);

if (empty($instancia))
    Utils::acabarRequest(["message" => "La instancia no existe.", "error" => true]);
else if ($instancia["solutionId"] != $solutionType)
    Utils::acabarRequest(["message" => "Tipo de instancia incorrecto.", "error" => true]);
else if (count($coordinates) < 3)
    Utils::acabarRequest(["message" => "Coordenadas inválidas.", "error" => true]);

$areaId = Utils::generarUUID();

$zoneData = [
    "id" => $areaId,
    "name" => $name,
    "vertices" => $coordinates,
    "color" => $color,
    "groupby" => "",
    "ion_type" => $areaType,
    "ion_zone_type" => $ion_zone_type,
    "cod_infraccion" => $cod_infraccion
];

$insert = $a->area_crowdest(
    "POST",
    $instanceId,
    $areaId,
    $zoneData
);

if ($insert !== false) {
    $zs = obtenerZonasDeteccion(cod_dispositivo: $cod_dispositivo, crowdest: true);
    insertarZonaDeteccion(
        $areaId,
        $instanceId,
        $ion_zone_type,
        $cod_ai,
        $solutionType,
        $cod_infraccion,
    );

    if (!(
        is_array($zs) &&
            empty($zs) &&
            isset($zs["error"])
    )){
        $i->instance_start($instanceId);
    } else {
        $i->instance_restart($instanceId);
    }
}

Utils::acabarRequest($insert);
