<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";

use Funciones\Devices;
use Funciones\NxConnection;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);
$fichero_logs = "vms.log";

$debug = $jsonobj2->debug ?? false;
if (!defined("DEBUG")) {
    define("DEBUG", $debug);
}

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$timestampMs = $jsonobj2->timestampMs ?? null;

$datos_dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);
$footages = [];
if (
    isset($datos_dispositivo["error"]) ||
        !is_array($datos_dispositivo) ||
        empty($datos_dispositivo) ||
        count($datos_dispositivo) > 1
) {
    acabarRequest([
        "message" => "Dispositivo no encontrado o no es único",
        "error" => true
    ], 500);
}

$disp = $datos_dispositivo[0];
$nx = new NxConnection(
    $disp->systemId,
    $disp->ip,
    $disp->puerto,
    $disp->user,
    $disp->password,
);

$format = "png";
$files = [];

$timestamp = DateTimeImmutable::createFromFormat('U.u', sprintf('%.6f', $timestampMs / 1000));
$timestamp->setTimezone(TIME_ZONE);
$timestamp = $timestamp->getTimestamp();

$timestamp = new DateTime("@{$timestamp}");
$timestamp->setTimezone(TIME_ZONE);

$timestamp = $timestamp->format("Uu") / 1000;

$result = Devices::getDeviceThumbnail($nx, $disp->deviceId, $timestamp, $format);
if (
    $result !== null &&
        $result !== false &&
        !isset($result["error"])
) {
    $files[] = ["file" => base64_encode($result), "format" => $format, "time" => $timestamp];
} else {
    $files[] = ["file" => $result, "time" => $timestamp];
}

acabarRequest($files);
