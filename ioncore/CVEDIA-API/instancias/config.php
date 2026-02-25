<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Instancia;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;

if (!$instanceId)
    Utils::acabarRequest([], 405);

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

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    Utils::acabarRequest($i->instance_config("GET", $instanceId));
} else if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $config_instance = $i->instance_config("GET", $instanceId);
    $hayCambios = false;

    if (isset($jsonobj2->confidence)) {
        $confidence = $jsonobj2->confidence;

        if (
            isset($config_instance["CrowdEstimation"])
            && isset($config_instance["CrowdEstimation"]["conf_threshold"])
        ) {
            $config_instance["CrowdEstimation"]["conf_threshold"] = $confidence;
            $hayCambios = true;
        }
    }

    if (isset($jsonobj2->newHandler) || isset($jsonobj2->editHandler)) {
        $newHandler = $jsonobj2->newHandler ?? null;
        $editHandler = $jsonobj2->editHandler ?? null;

        if (
            isset($config_instance["Output"])
            && isset($config_instance["Output"]["handlers"])
        ) {
            if (isset($newHandler)) {
                $config_instance["Output"]["handlers"][$newHandler->name] = $newHandler->data;
                $hayCambios = true;
            } else if (isset($editHandler)) {
                $config_instance["Output"]["handlers"][$editHandler->name] = $editHandler->data;
                $hayCambios = true;
            }
        }
    }

    if (!$hayCambios)
        Utils::acabarRequest([], 400);


    Utils::acabarRequest($i->instance_config(
        "POST",
        $instanceId,
        [
            "path" => "new/NewConf.json",
            "jsonValue" => $config_instance
        ]
    ));
}
