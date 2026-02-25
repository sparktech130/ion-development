<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use CVUtils\Utils;
use Funciones\Area;
use Funciones\Instancia;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;

if (!$instanceId) {
    Utils::acabarRequest([]);
}

$clouds = obtenerCloudsAnalysis(instanceId: $instanceId);
if (!(
    is_array($clouds) &&
        !empty($clouds) &&
        count($clouds) == 1 &&
        !isset($clouds["error"]) 
)){
    Utils::acabarRequest($clouds);
}

$c = $clouds[0];
$i = new Instancia(Utils::obtenerServer($c->ip, $c->puerto));

$dbAreas = obtenerZonasDeteccion(instanceId: $instanceId);
if (!(
    is_array($dbAreas) &&
        !empty($dbAreas) &&
        !isset($dbAreas["error"]) 
)) {
    Utils::acabarRequest($dbAreas);
}
$ag = [];
foreach ($dbAreas as $a) {
    if (!isset($a->zoneId)) continue;
    $ag[$a->zoneId] = $a;
}

$instance_config = $i->instance_config("GET", $instanceId);
$zonasConfig = [];
$areas = [];

if (!empty($instance_config)) {
    $zonasConfig = $instance_config["Zone"]["Zones"] ?? [];
}

if (isset($instance_config["SolutionId"]) && $instance_config["SolutionId"] === "crowd-estimation") {
    $areas["crowdingAreas"] = [];
    foreach ($zonasConfig as $key => $a) {
        $a["coordinates"] = $a["vertices"];
        unset($a["vertices"]);

        $a["type"] = "AreaCrowding";
        $a["extra_data"] = $ag[$a["id"]]->extra_data ?? "";

        $areas["crowdingAreas"][] = $a;
    }
} else {
    $a = new Area($i);

    $areas = $a->obtener_areas($instanceId);
    foreach ($areas as $key => $areaType) {
        foreach ($areaType as $ind => $a) {
            if (isset($a["id"])) {
                $newConf = $zonasConfig[$a["id"]];

                if (isset($newConf["color"])) unset($newConf["color"]);

                if (isset($newConf["vertices"])) unset($newConf["vertices"]);

                if (isset($newConf["id"])) unset($newConf["id"]);

                if (isset($newConf["name"])) unset($newConf["name"]);

                if (!isset($newConf["attribute_restrictions_values"])) {
                    $newConf["attribute_restrictions_values"] = [
                        "upper_clothing_color" => false,
                        "lower_clothing_color" => false,
                        "vehicle_class" =>  false,
                        "vehicle_color" => false,
                    ];
                }

                if (!isset($newConf["ion_type"])) {
                    $newConf["ion_type"] = $ag[$a["id"]]->ion_type;
                }

                if (!isset($newConf["ion_zone_type"])) {
                    $newConf["ion_zone_type"] = $ag[$a["id"]]->cod_tipo_area;
                }

                if (!isset($newConf["cod_infraccion"])) {
                    $newConf["cod_infraccion"] = $ag[$a["id"]]->cod_infraccion;
                }

                if (isset($newConf["left_duration"]) && $newConf["ion_type"] === "object_left") {
                    $areas[$key][$ind]["seconds"] = $newConf["left_duration"];
                } else if (isset($newConf["removed_duration"]) && $newConf["ion_type"] === "object_removed") {
                    $areas[$key][$ind]["seconds"] = $newConf["removed_duration"];
                }

                $areas[$key][$ind]["extra_data"] = $ag[$a["id"]]->extra_data ?? "";

                $areas[$key][$ind]["additionalConfig"] = $newConf ?? [];
            }
        }
    }
}
Utils::acabarRequest(
    $areas
);
