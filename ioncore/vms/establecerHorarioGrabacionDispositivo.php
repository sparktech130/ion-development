<?php
use Funciones\Devices;
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
$horario = $jsonobj2->horario ?? null;

$datos_dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);

if ($horario == null) {
    acabarRequest(["message" => "Horario no entoncrado", "error" => true], 500);
} else if (isset($datos_dispositivo["error"]) || !is_array($datos_dispositivo) || empty($datos_dispositivo) || count($datos_dispositivo) > 1) {
    acabarRequest(["message" => "Dispositivo no encontrado o no es único", "error" => true], 500);
} 

$disp = $datos_dispositivo[0];
if (!isset($disp->deviceId)) {
    acabarRequest(["message" => "DeviceId no establecido", "error" => true], 500);
}

$nx = new NxConnection(
    $disp->systemId,
    $disp->user,
    $disp->password,
    $disp->server,
    $disp->deviceId
);
$deviceData = $nx->getDevice($disp->deviceId);

$deviceSchedule = $horario;
$deviceData->schedule = $deviceSchedule;

$replace = Devices::replaceDevice(
    $nx,
    $deviceData,
    $disp->deviceId,
);
$status = 200;

if ($replace === false) {
    $status = 500;
} 
acabarRequest($replace, $status);

