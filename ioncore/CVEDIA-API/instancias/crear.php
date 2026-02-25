<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use CVUtils\Utils;
use Funciones\Instancia;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$streamQuality = match (strtolower($jsonobj2->streamQuality ?? null)) {
    "low" => 1,
    "high" => 0,
    default => 1,
};
$solutionId = $jsonobj2->solutionId ?? "securt";

$dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);

if (empty($dispositivo) || isset($dispositivo["error"]) || count($dispositivo) != 1)
    Utils::acabarRequest(["message" => "Dispositivo no encontrado"]);

$clouds = obtenerCloudsAnalysis(null, null, $cod_dispositivo);

$dispositivo = $dispositivo[0];

$deviceId = $dispositivo->deviceId;
$name = $deviceId;

if (!empty($clouds))
    Utils::acabarRequest(["message" => "Instancia ya existente"]);

$cloud_analysis = obtenerCloudOptimoInsertar();
if (!$cloud_analysis)
    Utils::acabarRequest([
        "message" => "No hay ningún cloud disponible",
        "cloud" => $cloud_analysis,
    ]);

$cod_cloud_analysis = $cloud_analysis->cod_cloud_analysis;
$analysis_url = Utils::obtenerServer($cloud_analysis->ip, $cloud_analysis->puerto);
$baseCVIp = ltrim(explode(":", $analysis_url)[1], "\/\/");

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

$group = $jsonobj2->group ?? $nombre_cloud ?? null;

$defaultGroups = [
    "Demos",
    "demos",
    "Persons",
    "Objects",
    "Faces",
    "Thermal",
    "Vehicles",
];

if (in_array($group, $defaultGroups)) {
    $group = "$solutionId";
} else {
    $group = "{$group} {$solutionId}";
}

$postData = [
    "name" => $name ?? null,
    "group" => $group,
    "solution" => $solutionId,  // crowd-estimation, securt (code)
    "persistent" => true,  // Booleano
    "frameRateLimit" => 5,  // Number
    "metadataMode" => true,  // boolean
    "statisticsMode" => true,  // boolean
    "diagnosticsMode" => false,  // boolean
    "debugMode" => false,  // boolean
    "detectorMode" => "SmartDetection",  // String ["SmartDetection", "Detection"]
    "detectionSensitivity" => "Medium",  // String ["Low", "Medium", "High"]
    "movementSensitivity" => "High",  // String ["Low", "Medium", "High"]
    "sensorModality" => "RGB",  // String ["RGB", "Thermal"]
    "autoStart" => false,  // boolean
    "autoRestart" => true,  // boolean
];

$invalidParams = [];

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

$attributesExtraction = "Both";
if (isset($jsonobj2->attributesExtraction)) {
    $opciones = ["Off", "Vehicle", "Person", "Both"];
    if (!in_array($jsonobj2->attributesExtraction, $opciones)) {
        $invalidParams[] = [
            "name" => "attributesExtraction",
            "options" => $opciones,
        ];
    }
}

if (!empty($invalidParams)) {
    acabarRequest([
        "message" => "Error de validación",
        "campos" => $invalidParams,
        "error" => true,
    ]);
}

$instanceClass = new Instancia($analysis_url);
$insert = $instanceClass->instance("POST", null, $postData);
$insert["running"] = false;

if ($insert === false)
    $insert["instanceId"] = null;


$instanceId = $insert["instanceId"] ?? null;

if ($instanceId != null) {
    insertarInstanciaCloud(
        $insert["instanceId"],
        $solutionId,
        $cod_dispositivo,
        $cod_cloud_analysis,
    );

    $rtspUrl = "rtsp://{$user}:{$password}@{$server}/{$deviceId}?stream={$streamQuality}";

    $mqttHost = MQTT_DATA["MQTT_HOST"];
    /* $mqttPort = MQTT_DATA["MQTT_PORT"]; */
    $mqttPort = "1883";

    $mqttServer = "mqtt://{$mqttHost}:{$mqttPort}";
    $ION_SERVER = $_ENV["ION_SERVER"];

    $mqttUser = MQTT_DATA["MQTT_USER"];
    $mqttPass = MQTT_DATA["MQTT_PASS"];
    $exports = [
        "eventsExport" => [
            "config" => [
                "certificate_path" => "",
                "encode_buffers" => true,
                "username" => $mqttUser,
                "password" => $mqttPass,
                "schema_events" => [
                    "event-loitering-end:1",
                    "event-area-enter:1",
                    "event-area-exit:1",
                    "event-line-crossing:1",
                    "event-intrusion:1",
                    "event-intrusion-end:1",
                    "attribute:1",
                    "crop:1",
                ],
                "minify" => true
            ],
            "sink" => "",
            "uri" => "{$mqttServer}/events_{$ION_SERVER}",
            "enabled" => true,
        ],
        "countExport" => [
            "config" => [
                "certificate_path" => "",
                "encode_buffers" => true,
                "username" => $mqttUser,
                "password" => $mqttPass,
                "script" => "assets/scripts/passthrough_augmented.lua",
                "schema_events" => new stdClass,
                "minify" => true
            ],
            "enabled" => true,
            "sink" => "count",
            "uri" => "{$mqttServer}/crowdest_{$ION_SERVER}",
        ]
    ];

    if ($solutionId === "securt") {
        $exportHandler = [
            "Mqtt" => $exports["eventsExport"],
        ];
    } else if ($solutionId === "crowd-estimation") {
        $exportHandler = [
            "Count Export" => $exports["countExport"],
        ];

        $analyticsType = [
            "DetectorRegions",
            "Zone"
        ];
    }

    $outputConfig = [
        "JSONExport" => [
            "enabled" => false
        ],
        "NXWitness" => [
            "enabled" => false
        ],
        "handlers" => $exportHandler,
        "temp" => "",
    ];

    $mqttPlugin = [
        "config" => [
            "mqtt_server" => $mqttServer,
            "client_id" => $instanceId,
            "consume_topic" => "cvediart",
        ]
    ];

    $insert["setInput"] = $instanceClass->instance_input($instanceId, $rtspUrl, "RTSP");
    $insert["setAttributes"] = $instanceClass->instance_attributes("POST", $instanceId, $attributesExtraction);
    $instanceClass->setOutputConfig($instanceId, $outputConfig);
    $instanceClass->setupMqttPlugin($instanceId, $mqttPlugin);
    if (isset($analyticsType)) {
        $instanceClass->setAnalyticsType($instanceId, $analyticsType);
    }

    if ($insert["setInput"] !== true) {
        $insert["instanceId"] = null;
        $instanceClass->instance("DELETE", $instanceId);

        eliminarInstanciaCloud($instanceId);
    } else if ($solutionId === "securt") {
        $insert["running"] = $instanceClass->instance_start($instanceId);
    }
}

Utils::acabarRequest($insert);
