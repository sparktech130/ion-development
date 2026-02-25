<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use CVUtils\Utils;
use Funciones\Instancia;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

if (!isset($jsonobj2->instanceId)) {
    acabarRequest([
        "message" => "Instancia inválida",
        "error" => true,
    ]);
}

$instanceId = $jsonobj2->instanceId ?? null;

$instancia = obtenerDispositivosCloudAnalysis(instanceId: $instanceId);
if (!(
    $instancia &&
    is_array($instancia) &&
    !isset($instancia["error"]) &&
    count($instancia) === 1
)) {
    acabarRequest([
        "message" => "Instancia inválida o no encontrada",
        "instancia" => $instancia,
        "error" => true,
    ]);
}
$instancia = $instancia[0];

$cod_cloud_analysis = $instancia->cod_cloud_analysis;
$analysis_url = Utils::obtenerServer($instancia->ip, $instancia->puerto);
$baseCVIp = ltrim(explode(":", $analysis_url)[1], "\/\/");

$dispositivo = obtenerDispositivosDatosCloud($instancia->cod_dispositivo);

if (empty($dispositivo) || isset($dispositivo["error"]) || count($dispositivo) != 1) {
    Utils::acabarRequest(["message" => "Dispositivo no encontrado"]);
}
$dispositivo = $dispositivo[0];

$deviceId = $dispositivo->deviceId;
$nom_dispositivo = $dispositivo->nom_dispositivo;

$nombre_cloud = $dispositivo->nombre_cloud;

$ip = $dispositivo->ip;
$puerto = $dispositivo->puerto;

$server = "{$ip}:{$puerto}";
if ($baseCVIp === $ip) {
    $server = $dispositivo->streamUrl;
}

$user = $dispositivo->user;
$password = $dispositivo->password;

if (!isset($ip) || !isset($puerto)) {
    Utils::acabarRequest([
        "message" => "No se ha podido obtener la dirección de stream",
        "error" => true,
    ]);
}

$instanceId = $jsonobj2->instanceId ?? null;
$instanceClass = new Instancia($analysis_url);

$instanciaCV = $instanceClass->instance(instanceId: $instanceId);

if (!(
    $instanciaCV &&
    !empty($instanciaCV)
)) {
    acabarRequest([
        "message" => "No se ha podido obtener la instancia",
        "instancia" => $instanciaCV,
        "error" => true,
    ]);
}

$postData = [];
$invalidParams = [];
$update = [
    "streamQuality" => false,
    "parameters" => false,
];

if (isset($jsonobj2->frameRateLimit)) { // int
    $postData["frameRateLimit"] = (int)$jsonobj2->frameRateLimit;
}

if (isset($jsonobj2->metadataMode)) { // boolean
    $postData["metadataMode"] = (bool)$jsonobj2->metadataMode;
}

if (isset($jsonobj2->statisticsMode)) { // boolean
    $postData["statisticsMode"] = (bool)$jsonobj2->statisticsMode;
}

if (isset($jsonobj2->diagnosticsMode)) { // boolean
    $postData["diagnosticsMode"] = (bool)$jsonobj2->diagnosticsMode;
}

if (isset($jsonobj2->debugMode)) { // boolean
    $postData["debugMode"] = (bool)$jsonobj2->debugMode;
}

if (isset($jsonobj2->detectorMode)) {
    $opciones = ["SmartDetection", "Detection"];
    if (!in_array($jsonobj2->detectorMode, $opciones)) {
        $invalidParams[] = [
            "name" => "detectorMode",
            "options" => $opciones,
        ];
    }
    $postData["detectorMode"] = $jsonobj2->detectorMode;
}

if (isset($jsonobj2->detectionSensitivity)) {
    $opciones = ["Low", "Medium", "High"];
    if (!in_array($jsonobj2->detectionSensitivity, $opciones)) {
        $invalidParams[] = [
            "name" => "detectionSensitivity",
            "options" => $opciones,
        ];
    }
    $postData["detectionSensitivity"] = $jsonobj2->detectionSensitivity;
}

if (isset($jsonobj2->movementSensitivity)) {
    $opciones = ["Low", "Medium", "High"];
    if (!in_array($jsonobj2->movementSensitivity, $opciones)) {
        $invalidParams[] = [
            "name" => "movementSensitivity",
            "options" => $opciones,
        ];
    }

    $postData["movementSensitivity"] = $jsonobj2->movementSensitivity;
}

if (isset($jsonobj2->sensorModality)) {
    $opciones = ["RGB", "Thermal"];
    if (!in_array($jsonobj2->sensorModality, $opciones)) {
        $invalidParams[] = [
            "name" => "sensorModality",
            "options" => $opciones,
        ];
    }

    $postData["sensorModality"] = $jsonobj2->sensorModality;
}

if (isset($jsonobj2->autoStart)) { // boolean
    $postData["autoStart"] = (bool)$jsonobj2->autoStart;
}

if (isset($jsonobj2->autoRestart)) { // boolean
    $postData["autoRestart"] = (bool)$jsonobj2->autoRestart;
}

if (isset($jsonobj2->autoRestart)) { // boolean
    $postData["autoRestart"] = (bool)$jsonobj2->autoRestart;
}

$streamQuality = null;
if (isset($jsonobj2->streamQuality)) {
    $streamQuality = match (strtolower($jsonobj2->streamQuality ?? "")) {
        "low" => 1,
        "high" => 0,
        default => 1,
    };
}

if (isset($jsonobj2->attributesExtraction)) {
    $opciones = ["Off", "Vehicle", "Person", "Both"];
    if (!in_array($jsonobj2->attributesExtraction, $opciones)) {
        $invalidParams[] = [
            "name" => "attributesExtraction",
            "options" => $opciones,
        ];
    } else {
        $update["setAttributes"] = $instanceClass->instance_attributes("POST", $instanceId, $jsonobj2->attributesExtraction);
    }
}

if (!empty($invalidParams)) {
    acabarRequest([
        "message" => "Error de validación",
        "campos" => $invalidParams,
        "error" => true,
    ]);
}

$rtspUrl = null;
if ($streamQuality !== null) {
    $rtspUrl = "rtsp://{$user}:{$password}@{$server}/{$deviceId}?stream={$streamQuality}";

    $update["streamQuality"] = $instanceClass->instance_input($instanceId, $rtspUrl, "RTSP");
}

$update["parameters"] = false;
if (!empty($postData)) {
    $up = $instanceClass->instance(
        method: "PATCH",
        instanceId: $instanceId,
        postData: $postData,
    );
    $update["parameters"] = empty($up) ? true : $up;
}

acabarRequest([
    "update" => $update,
]);
