<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Instancia;
use Funciones\Line;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;
$attribute_restrictions = $jsonobj2->attribute_restrictions ?? null;
$lineId = $jsonobj2->lineId ?? null;
$name = $jsonobj2->name ?? "";
$coordinates = $jsonobj2->coordinates ?? [];
$classes = $jsonobj2->classes ?? []; // Person, Animal, Vehicle, Face, Unknown
$direction = $jsonobj2->direction ?? ""; // Up, Down, Both
$color = $jsonobj2->color ?? [];
$ion_zone_type = $jsonobj2->ion_zone_type ?? null;
$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$cod_infraccion = $jsonobj2->cod_infraccion ?? null;
$lineType = "crossing";
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

if (!(
    $instanceId
        && $lineId
        && (($coordinates && $classes && $direction && $color) || $attribute_restrictions)
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
$l = new Line($i);

$crossing_lines = $l->obtener_lines($instanceId)["crossingLines"] ?? [];

$existeLinea = function () use ($crossing_lines, $lineId) {
    foreach ($crossing_lines as $line) {
        if ($line["id"] == $lineId)
        return $line;
    }

    return false;
};

// Comprobamos si existe el área recibida
$line = $existeLinea($crossing_lines, $lineId);
if (!$line)
    Utils::acabarRequest(["message" => "La línea no existe"]);

// Eliminamos la línea
$l->delete_line(
    $instanceId,
    $lineId
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
    "direction" => $direction,
    "classes" => $classes,
    "color" => $color
];

$update = $l->line(
    "PUT",
    $lineType,
    $instanceId,
    $lineId,
    $postData
);

if ($update !== true) {
    $postData["name"] = $line["name"];
    $postData["coordinates"] = $line["coordinates"];
    $postData["direction"] = $line["direction"];
    $postData["classes"] = $line["classes"];
    $postData["color"] = $line["color"];

    $update = $l->line(
        "PUT",
        $lineType,
        $instanceId,
        $lineId,
        $postData
    );
}

if ($ion_zone_type != null) {
    $i->setCodInfraccion($instanceId, $lineId, "line", $cod_infraccion);
    $i->setIonZoneType($instanceId, $lineId, "line", $ion_zone_type);
    modificarZonaDeteccion(
        $lineId,
        $instanceId,
        $ion_zone_type,
        $cod_ai,
        "securt",
        $cod_infraccion
    );
}

$i->setIonLineType($instanceId, $lineId, "line_{$lineType}");

if (isset($addFace) && $addFace === true) {
    $i->setFaceClass($instanceId, $lineId, "line");
} 

$i->update_zone_attributes($instanceId, $lineId, $attribute_restrictions, "line");

$i->instance_restart($instanceId);

Utils::acabarRequest($update);
