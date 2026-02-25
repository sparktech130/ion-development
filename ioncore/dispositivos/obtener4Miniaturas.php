<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";

use Funciones\NxConnection;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

if (!isset($jsonobj2->cod_dispositivo)) {
    acabarRequest(["message" => "Dispositivo no recibido.", "error" => true], 500);
}
$cod_dispositivo = $jsonobj2->cod_dispositivo;

$dispositivo = obtenerDispositivos($cod_dispositivo);

if (isset($dispositivo["error"]) || empty($dispositivo)) {
    acabarRequest(["message" => "Dispositivo no encontrado.", "error" => true], 500);
}
$dispositivo = $dispositivo[0];

$cloud = obtenerCloudsParam($dispositivo->cod_cloud);

if (isset($cloud["error"]) || empty($cloud)) {
    acabarRequest(["message" => "Cloud no encontrado.", "error" => true], 500);
}

$cloud = $cloud[0];

$systemId = $cloud->systemId;
$user = $cloud->user;
$password = $cloud->password;

$nx = new NxConnection(
    $cloud->systemId,
    $cloud->ip,
    $cloud->puerto,
    $cloud->user,
    $cloud->password,
);

$deviceId = $dispositivo->deviceId ?? null;

if (!isset($deviceId)) {
    $nxDevices = $nx->getDevice($dispositivo->direccion_mac);

    if (!isset($nxDevices) || empty($nxDevices)) {
        acabarRequest(["message" => "Dispositivo no encontrado en el cloud.", "error" => true], 500);
    }

    foreach ($nxDevices as $dispNx) {
        if (isset($dispNx->mac) && $dispNx->mac == $dispositivo->direccion_mac) {
            $deviceId = trim($dispNx->id, "{}");
            break;
        }
    }
}

if (!isset($deviceId)) {
    acabarRequest(["message" => "Dispositivo no encontrado en el cloud.", "error" => true], 500);
}

if (isset($jsonobj2->timestamp)) {
    $timestamp = $jsonobj2->timestamp;
    $timestamp = DateTimeImmutable::createFromFormat("U", $timestamp / 1000);
    $timestamp = $timestamp->getTimestamp();
} else {
    $baseTime = new DateTime("now");
    $baseTime->setTimezone(TIME_ZONE);
    $baseTime->modify("-2 seconds");
    $timestamp = $baseTime->getTimestamp();
}

acabarRequest(getDeviceThumbnail4Times($nx, $deviceId, $timestamp), 200);
