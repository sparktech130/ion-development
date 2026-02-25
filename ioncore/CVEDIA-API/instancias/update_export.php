<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use CVUtils\Utils;
use Funciones\Instancia;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;
$cloud_analysis = obtenerCloudOptimoInsertar();
if (!$cloud_analysis)
    Utils::acabarRequest([
        "message" => "No hay ningún cloud disponible", 
        "cloud" => $cloud_analysis,
    ]);

$cod_cloud_analysis = $cloud_analysis->cod_cloud_analysis;
$analysis_url = Utils::obtenerServer($cloud_analysis->ip, $cloud_analysis->puerto);

$instanceClass = new Instancia($analysis_url);
if ($instanceId != null) {
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
                "certificate_path"=> "",
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
                ],
                "minify" => true
            ],
            "sink" => "",
            "uri" => "{$mqttServer}/events_{$ION_SERVER}",
            "enabled" => true,
        ],
        "countExport" => [
            "config" => [
                "certificate_path"=> "",
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

    $exportHandler = [
        "Mqtt" => $exports["eventsExport"],
    ];

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
        "config"=> [
            "mqtt_server" => $mqttServer,
            "client_id" => $instanceId,
            "consume_topic" => "cvediart",
        ]
    ];

    $instanceClass->setOutputConfig($instanceId, $outputConfig);
    $instanceClass->setupMqttPlugin($instanceId, $mqttPlugin);
}
