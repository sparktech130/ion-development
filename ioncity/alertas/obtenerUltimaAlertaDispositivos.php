<?php

use Funciones\Devices;
use Funciones\NxConnection;

require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/alertas/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_alertagest = $jsonobj2->cod_alertagest ?? null;
$modulos = $jsonobj2->modulos ?? null;
$obtenerClip = $jsonobj2->obtenerClip ?? false;

$alertas = obtenerUltimaAlertaDispositivos(
    $cod_alertagest,
    $modulos,
);

if ($obtenerClip === false) {
    acabarRequest($alertas);
}

require_once $_SERVER['DOCUMENT_ROOT'] . "/core/cloud_nx/main.php";

if (!(!empty($alertas) && !isset($alertas["error"]))) {
    acabarRequest($alertas);
}
$dispositivos = obtenerDispositivosDatosCloud();
$clouds = obtenerCloudsParam();
$cloudsObject = [];

foreach ($alertas as $key => $alerta) {
    [$mkv_url, $mp4_url, $tipos_stream] = null;

    $pos = new DateTime($alerta->fecha_hora);
    $pos->setTimezone(TIME_ZONE);
    $clipPos = $pos->getTimestamp();
    $duration = 15;

    foreach ($dispositivos as $disp) {
        if (
            $alerta->cod_dispositivo != $disp->cod_dispositivo ||
                $disp->deviceId === null
        ) {
            continue;
        }

        if (!isset($cloudsObject[$disp->systemId])) {
            $cloudsObject[$disp->systemId] = new NxConnection(
                systemId: $disp->systemId,
                ip: $disp->ip,
                puerto: $disp->puerto,
                user: $disp->user,
                password: $disp->password,
            );
        }

        [$mkv_url, $mp4_url] = Devices::getNxStreamingUrl(
            nx: $cloudsObject[$disp->systemId],
            deviceId: $disp->deviceId,
            pos: $clipPos,
            durationMs: $duration * 1000,
        );

        $tipos_stream = Devices::obtenerTipoGrabacionMomento(
            device: $cloudsObject[$disp->systemId]->getDevice($disp->deviceId),
            pos: $clipPos,
        );


        if ($mkv_url) { break; }
    }

    $alerta->tipos_stream = $tipos_stream ?? null;
    if ($mkv_url && $mp4_url) {
        $alerta->mkv_url = [
            "default" => "$mkv_url",
            "low" => "$mkv_url&stream=1",
            "high" => "$mkv_url&stream=0"
        ];

        $alerta->mp4_url = [
            "default" => "$mp4_url",
            "low" => "$mp4_url&stream=1",
            "high" => "$mp4_url&stream=0"
        ];
    }
}

acabarRequest($alertas);

