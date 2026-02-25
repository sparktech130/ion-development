<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/dispositivos/main.php";

use Funciones\Devices;
use Funciones\NxConnection;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$presetId = $jsonobj2->presetId ?? null;
$presetName = $jsonobj2->presetName ?? null;
$speed = $jsonobj2->speed ?? 0.5;

$campos_necesarios = [
    "obtener" => [$cod_dispositivo],
    "establecer_actual" => [$cod_dispositivo, $presetName],
    "modificar" => [$cod_dispositivo, $presetId, $presetName],
    "eliminar" => [$cod_dispositivo, $presetId],
    "activar" => [$cod_dispositivo, $presetId, $speed]
];
$cumple_campos_necesarios = function ($comando) use ($campos_necesarios) {
    $campos = $campos_necesarios[$comando] ?? [];
    foreach ($campos as $campo) {
        if (!isset($campo)) return false;
    }
    return true;
};

$comando = $jsonobj2->comando;
$method = "POST";
switch ($comando) {
    case "obtener":
        $nxCommand = "GetPresetsPtzCommand";
        break;
    case "establecer_actual":
        $nxCommand = "CreatePresetPtzCommand";
        $presetId = "{" . generarUUID() . "}";
        break;
    case "modificar":
        $nxCommand = "UpdatePresetPtzCommand";
        break;
    case "eliminar":
        $nxCommand = "RemovePresetPtzCommand";
        break;
    case "activar":
        $nxCommand = "ActivatePresetPtzCommand";
        break;
    default:
        $comando = "obtener";
        $nxCommand = "GetPresetsPtzCommand";
        break;
}

if (!$cumple_campos_necesarios($comando)) acabarRequest([
    "message" => "Campos necesarios no recibidos",
    "campos_necesarios" => $campos_necesarios[$comando] ?? [],
    "error" => true
], 200);

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

$response = Devices::ptz(
    method: $method,
    nx: $nx,
    command: $nxCommand,
    deviceId: $deviceId,
    speedParams: isset($speed) ? ["speed" => $speed] : null,
    presetId: $presetId,
    presetName: $presetName,
);
acabarRequest($response);
