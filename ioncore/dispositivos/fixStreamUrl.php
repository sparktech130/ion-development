<?php

use Funciones\NxConnection;

require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/cloud_nx/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$dispositivosReturn = [];
$cod_cloud = $jsonobj2->cod_cloud ?? null;

$cloud = obtenerCloudsParam($cod_cloud);
$cloud = $cloud[0];

$dispositivos = obtenerDispositivosDatosCloud(
    cod_cloud: $cod_cloud
);

$systemId = $cloud->systemId;
$user = $cloud->user;
$password = $cloud->password;
$ip = $cloud->ip ?? null;
$puerto = $cloud->puerto ?? null;

$nx = new NxConnection(
    $systemId,
    $ip,
    $puerto,
    $user,
    $password,
);

foreach ($dispositivos as $disp) {
    $streamUrl = $disp->streamUrl;
    if ($streamUrl) {
        $dispositivosReturn[$disp->cod_dispositivo] = "Ya tiene";
        continue;
    }

    $dispositivoNx = $nx->getDevice($disp->deviceId);

    $insert = true;
    if (!isset($dispositivoNx->id)) {
        $dispositivosReturn[$disp->cod_dispositivo] = [
            "message" => "Dispositivo no encontrado",
            "error" => true,
        ];
    }

    $serverId = trim($dispositivoNx->serverId ?? "", "{} ");
    $serverUrl = $nx->getServerUrl($serverId);

    if (!$serverUrl) {
        $dispositivosReturn[$disp->cod_dispositivo] = [
            "message" => "Error al obtener la dirección del servidor.",
            "error" => true,
        ];
        continue;
    }

    $dispositivosReturn[$disp->cod_dispositivo] = (object)[
        "url" => $serverUrl,
        "update" => modificarDispositivos(
            cod_dispositivo: $disp->cod_dispositivo,
            streamUrl: $serverUrl
        )
    ];
}
acabarRequest($dispositivosReturn);

