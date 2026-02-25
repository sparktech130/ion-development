<?php
use Funciones\NxConnection;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);
$fichero_logs = "vms.log";

$debug = $jsonobj2->debug ?? false;
if (!defined("DEBUG")) {
    define("DEBUG", $debug);
}

require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;

$datos_dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);

if (
    isset($datos_dispositivo["error"]) ||
        !is_array($datos_dispositivo) ||
        empty($datos_dispositivo) ||
        count($datos_dispositivo) > 1
) {
    acabarRequest(["message" => "Dispositivo no encontrado o no es único", "error" => true], 500);
} 

$disp = $datos_dispositivo[0];

if (!isset($disp->deviceId)){
    acabarRequest(["message" => "deviceId no establecida", "error" => true], 500);
}

$nx = new NxConnection(
    systemId: $disp->systemId,
    ip: $disp->ip,
    puerto: $disp->puerto,
    user: $disp->user,
    password: $disp->password,
);
$device = $nx->getDevice($disp->deviceId);
$deviceSchedule = $device->schedule;

acabarRequest($deviceSchedule);
