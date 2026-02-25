<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

$mqttServer   = $_ENV["MQTT_BROKER"] ?? null;
$mqttPort     = $_ENV["MQTT_PORT"] ?? 1883;

$uuid = generarUUID();
$mqttClientId =  "{$uuid}_{$_ENV["ION_SERVER"]}_platform";

$mqttUsername = $_ENV["MQTT_USER"] ?? null;
$mqttPassword = $_ENV["MQTT_PASSWORD"] ?? null;

use PhpMqtt\Client\ConnectionSettings;
use PhpMqtt\Client\MqttClient;

$mqttClient = null;
$connectionSettings = null;
try {
    if ($mqttServer != null) {
        $mqttClient = new MqttClient($mqttServer, $mqttPort, $mqttClientId);
        $connectionSettings = new ConnectionSettings();
        $connectionSettings = $connectionSettings
            ->setConnectTimeout(3)
            ->setUseTls(true)
            ->setTlsSelfSignedAllowed(true)
            ->setUsername($mqttUsername)
            ->setPassword($mqttPassword);
    }
} catch (Exception $e) {
    EscribirLog(
        "Error al conectar con el broker: {$e->getMessage()}\n",
        "error",
    );
} finally {
    $_SESSION["MQTT_CLIENT"] = $mqttClient;
    $_SESSION["MQTT_SETTINGS"] = $connectionSettings;
}

function enviarDatosBroker(
    $topic = null,
    $message = null,
    $qos = 1,
) {
    if (!($_SESSION["MQTT_CLIENT"] && $_SESSION["MQTT_SETTINGS"])) {
        EscribirLog(
            "Error al conectar con el broker\n",
            "error",
        );
        return false;
    }

    try {
        $_SESSION["MQTT_CLIENT"]->connect($_SESSION["MQTT_SETTINGS"], true);
        $_SESSION["MQTT_CLIENT"]->publish($topic, $message, $qos);
        $_SESSION["MQTT_CLIENT"]->disconnect();
        return true;
    } catch (Exception $e) {
        EscribirLog(
            "Error al conectar con el broker: {$e->getMessage()}\n",
            "error",
        );
        return false;
    }
}

/**
 * @param type ["updates", "deletes"]
 * @param datos unencoded object|array
 * */
function enviarActualizacionTablaBroker($type = "updates", $datos = null)
{
    if (!in_array($type, ["updates", "deletes"])) {
        return false;
    }
    $topic = sprintf("%s/database/%s", $_ENV["ION_SERVER"], $type);

    return enviarDatosBroker($topic, json_encode($datos, JSON_UNESCAPED_SLASHES));
}

function enviarActualizacionDispositivos($type = "updates", $cod_dispositivo = null)
{
    if (!in_array($type, ["updates", "deletes"])) {
        return false;
    } else if (!$cod_dispositivo) {
        return false;
    }

    $datos = [
        "table" => "dispositivos",
        "cod_dispositivo" => (int)$cod_dispositivo
    ];
    return enviarActualizacionTablaBroker($type, $datos);
}

function enviarActualizacionCloudsNx($type = "updates", $cod_cloud = null)
{
    if (!in_array($type, ["updates", "deletes"])) {
        return false;
    } else if (!$cod_cloud) {
        return false;
    }

    $datos = [
        "table" => "cloud_nx",
        "cod_cloud" => (int)$cod_cloud
    ];
    return enviarActualizacionTablaBroker($type, $datos);
}

function enviarActualizacionInstancias($type = "updates", $instanceId = null)
{
    if (!in_array($type, ["updates", "deletes"])) {
        return false;
    } else if (!$instanceId) {
        return false;
    }

    $datos = [
        "table" => "instances",
        "instanceId" => $instanceId
    ];
    return enviarActualizacionTablaBroker($type, $datos);
}

function enviarActualizacionZonasDeteccion($type = "updates", $zoneId = null)
{
    if (!in_array($type, ["updates", "deletes"])) {
        return false;
    } else if (!$zoneId) {
        return false;
    }

    $datos = [
        "table" => "zonas_deteccion",
        "zoneId" => $zoneId
    ];
    return enviarActualizacionTablaBroker($type, $datos);
}
