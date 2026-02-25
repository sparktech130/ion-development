<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";

use Funciones\Devices;
use Funciones\NxConnection;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$pos = $jsonobj2->pos ?? null;
$durationMs = $jsonobj2->durationMs ?? null;
$getThumbnail = $jsonobj2->getThumbnail ?? false;
$sinComprobacion = $jsonobj2->sinComprobacion ?? false;

$dispositivos = obtenerDispositivosDatosCloud(
    cod_dispositivo: $cod_dispositivo,
    sinComprobacion: $sinComprobacion,
);

if (!is_array($dispositivos)) {
    acabarRequest(["message" => "Dispositivos no encontrados", "error" => true], 500);
}
$returnObj = [];

$clouds = [];
foreach ($dispositivos as $disp) {
    if (!isset($clouds[$disp->systemId])) {
        $clouds[$disp->systemId] = new NxConnection(
            $disp->systemId,
            $disp->ip,
            $disp->puerto,
            $disp->user,
            $disp->password,
        );
    }

    $nx = $clouds[$disp->systemId];
    if (!isset($disp->deviceId)) {
        continue;
    }

    $allUrls = Devices::getNxStreamingUrl(
        nx: $nx, 
        deviceId: $disp->deviceId,
        pos: $pos, 
        durationMs: $durationMs,
    );
    if ($allUrls != null) {
        [$mkv_url, $mp4_url] = $allUrls;
        $dev = $nx->getDevice($disp->deviceId);
        $disp->tipos_stream = Devices::obtenerTipoGrabacionMomento(
            device: $dev,
            pos: $pos,
        );

        $disp->b64_thumbnail = null;
        if ($getThumbnail == true) {
            $disp->b64_thumbnail = base64_encode(Devices::getDeviceThumbnail(
                nx: $nx,
                deviceId: $disp->deviceId,
                time: $pos,
                format: "png",
            ));
        }

        $disp->mkv_url = [
            "default" => "$mkv_url",
            "low" => "$mkv_url&stream=1",
            "high" => "$mkv_url&stream=0"
        ];

        $disp->mp4_url = [
            "default" => "$mp4_url",
            "low" => "$mp4_url&stream=1",
            "high" => "$mp4_url&stream=0"
        ];
    }

    $disp->user = "*****";
    $disp->password = "*****";

    $returnObj[] = $disp;
}

acabarRequest($returnObj);
