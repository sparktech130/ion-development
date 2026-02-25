<?php

use Funciones\Devices;
use Funciones\NxConnection;

require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

if (isset($jsonobj2->cod_dispositivo)) {
    $cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
} else {
    acabarRequest(["message" => "Dispositivo no recibido", "error" => true], 500);
}

$pos = $jsonobj2->pos ?? null;
$durationMs = $jsonobj2->durationMs ?? null;

$dispositivos = obtenerDispositivosDatosCloud(
    cod_dispositivo: $cod_dispositivo,
);

$returnObj = [];
if (!is_array($dispositivos)) {
    acabarRequest(["message" => "Dispositivos no encontrados", "error" => true], 500);
} 

$disp = $dispositivos[0];

$nx = new NxConnection(
    systemId: $disp->systemId,
    ip: $disp->ip,
    puerto: $disp->puerto,
    user: $disp->user,
    password: $disp->password,
);

if (!isset($disp->deviceId)) {
    acabarRequest([]);
}
$deviceId = $disp->deviceId;

$device = $nx->getDevice($disp->deviceId);
$allUrls = Devices::getNxStreamingUrl(
    nx: $nx,
    deviceId: $deviceId,
    pos: $pos,
    durationMs: $durationMs
);

[$mkv_url, $mp4_url] = $allUrls;
if ($pos != null) {
    $mkv_url .= "&accurateSeek=true&pos=$pos";
    $mp4_url .= "&accurateSeek=true&pos=$pos";

    if ($durationMs != null) {
        $endPos = $pos + $durationMs;
        $mkv_url .= "&endPos=$endPos";
        $mp4_url .= "&endPos=$endPos";
    }
}

$URLDescargaFinal = "$mkv_url&stream=1&download=true";
$returnObj["tipos_stream"] = Devices::obtenerTipoGrabacionMomento(
    pos: $pos,
    device: $device,
);

$returnObj["mkv_url"] = [
    "default" => "$mkv_url&download=true",
    "low" => "$mkv_url&stream=1&download=true",
    "high" => "$mkv_url&stream=0&download=true"
];

$returnObj["mp4_url"] = [
    "default" => "$mp4_url&download=true",
    "low" => "$mp4_url&stream=1&download=true",
    "high" => "$mp4_url&stream=0&download=true"
];

acabarRequest($returnObj);
