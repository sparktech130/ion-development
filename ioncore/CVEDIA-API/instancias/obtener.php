<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Instancia;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;
$cod_cloud_analysis = $jsonobj2->cod_cloud_analysis ?? null;

if ($instanceId) {
    $clouds = obtenerCloudsAnalysis(instanceId: $instanceId, activo: true);
    $instancia = null;
    if (
        is_array($clouds) &&
        !empty($clouds) &&
        !isset($clouds["error"])
    ) {
        $c = $clouds[0];
        $server = Utils::obtenerServer($c->ip, $c->puerto);

        $instance = new Instancia($server);

        Utils::acabarRequest($instance->instance("GET", $instanceId));
    }
}

$instances = [];
$clouds = obtenerCloudsAnalysis(cod_cloud: $cod_cloud_analysis, activo: true);
if (
    is_array($clouds) &&
    !empty($clouds) &&
    !isset($clouds["error"])
) {
    $instanciasDB = obtenerDispositivosCloudAnalysis(cod_cloud: $cod_cloud_analysis);
    $instanciasMap = [];
    foreach ($instanciasDB as $ins) {
        $instanciasMap[$ins->instanceId] = $ins;
    }

    foreach ($clouds as $c) {
        $server = Utils::obtenerServer($c->ip, $c->puerto);

        $i = new Instancia($server);
        $instancias_cloud = $i->instances("GET");

        if (isset($instancias_cloud["instances"])) {
            foreach ($instancias_cloud["instances"] as $key => $ic) {
                if (!isset($instanciasMap[$ic["instanceId"]])) {
                    unset($instancias_cloud["instances"][$key]);
                    continue;
                }

                $config = $i->instance_config(
                    method: "GET",
                    instanceId: $ic["instanceId"],
                );
                $instancias_cloud["instances"][$key]["attributesExtraction"] = $i->instance_attributes(
                    "GET",
                    $ic["instanceId"],
                );
                $instancias_cloud["instances"][$key]["lpr"] = $i->lpr(instanceId: $ic["instanceId"]);
                $instancias_cloud["instances"][$key]["streamQuality"] = "unknown";

                $str = $config["Input"]["uri"];

                // 1. Extraer la URL RTSP del string (la que empieza con rtsp://)
                preg_match('/uri=(rtsp:\/\/[^\s]+)/', $str, $matches);
                if (isset($matches[1])) {
                    $uri = $matches[1];

                    // 2. Parsear la URL y extraer la query
                    $parts = parse_url($uri);

                    if (isset($parts['query'])) {
                        parse_str($parts['query'], $params);

                        // 3. Obtener el valor de 'stream'
                        if (!isset($params['stream'])) {
                            continue;
                        }
                        $instancias_cloud["instances"][$key]["streamQuality"] = match ((int)$params['stream']) {
                            1 => "low",
                            0 => "high",
                            default => "unknown",
                        };
                    }
                }
            }
            $instances = array_merge($instances, $instancias_cloud["instances"]);
        }
    }
}
Utils::acabarRequest(["instances" => array_values($instances)]);
