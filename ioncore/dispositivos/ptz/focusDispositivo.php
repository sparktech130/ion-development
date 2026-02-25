<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/dispositivos/main.php";

use Funciones\Devices;
use Funciones\NxConnection;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$command = "ContinuousFocusPtzCommand";

$speedParams = [
    "speed" => $jsonobj2->speed ?? 0,
];

if (!$cod_dispositivo) {
    acabarRequest(["message" => "Dispositivo no recibido", "error" => true], 200);
} 

$datos_dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);

if (!(
    !empty($datos_dispositivo) &&
        !isset($datos_dispositivo["error"])
)) {
    acabarRequest(["message" => "Dispositivo no configurado", "error" => true], 200);
}

$disp = $datos_dispositivo[0];

$nx = new NxConnection(
    $disp->systemId,
    $disp->ip,
    $disp->puerto,
    $disp->user,
    $disp->password,
);

acabarRequest(
    Devices::ptz(
        method: "POST", 
        nx: $nx, 
        command: $command, 
        deviceId: $deviceId, 
        speedParams: $speedParams,
    )
);
