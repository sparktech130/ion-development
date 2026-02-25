<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Line;
use Funciones\Instancia;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;
$attribute_restrictions = $jsonobj2->attribute_restrictions ?? null;
$lineId = $jsonobj2->lineId ?? null;

if (!(
    $instanceId
        && $lineId
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
$l = new Line($i);

$lines = $l->obtener_lines_full($instanceId)["crossingLines"] ?? [];

$existeLinea = function () use ($lines, $lineId) {
    foreach ($lines as $lineType) {
        foreach ($lineType as $line) {
            if (isset($line["id"]) && $line["id"] == $lineId)
            return $line;
        }
    }

    return false;
};

// Comprobamos si existe el área recibida
$line = $existeLinea();
if (!$line)
    Utils::acabarRequest(["message" => "La línea no existe"]);

$update = $i->update_zone_attributes($instanceId, $lineId, $attribute_restrictions, "line");

Utils::acabarRequest($update);
