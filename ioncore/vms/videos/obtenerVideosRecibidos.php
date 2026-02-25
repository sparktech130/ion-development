<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

use Funciones\NxConnection;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$cod_video = $jsonobj2->cod_video ?? null;
$fecha_ini = $jsonobj2->fecha_ini ?? null;
$fecha_fin = $jsonobj2->fecha_fin ?? null;
$cod_usuario = $jsonobj2->cod_usuario ?? null;
$limit = $jsonobj2->limit ?? null;
$obtenerStreams = $jsonobj2->obtenerStreams ?? false;
$cod_modulo = $jsonobj2->cod_modulo ?? false;
$enlace_video = $jsonobj2->enlace_video ?? false;

$usuario_compartido = $cod_usuario_token;

$cantidad_videos = obtenerVideosRecibidosCount($usuario_compartido, $cod_modulo, $enlace_video);
$videos = obtenerVideosRecibidos($usuario_compartido, $cod_video, $cod_dispositivo, $fecha_ini, $fecha_fin, $cod_usuario, $cod_modulo, $enlace_video, $limit);

if (!(!empty($videos) && !isset($videos["error"]))) {
    acabarRequest([]);
}

if (!$obtenerStreams) {
    acabarRequest([
        "total" => $cantidad_videos,
        "rows" => $videos
    ]);
}

$datos_clouds = [];
foreach ($videos as $clip) {
    if ($clip->enlace_video) {
        continue;
    }
    $dispositivo = obtenerDispositivosDatosCloud($clip->cod_dispositivo);
    $disp = $dispositivo[0];

    $deviceId = $disp->deviceId;
    if (!isset($datos_clouds[$systemId])) {
        $datos_clouds[$systemId] = new NxConnection(
            systemId: $disp->systemId,
            ip: $disp->ip,
            puerto: $disp->puerto,
            user: $disp->user,
            password: $disp->password,
        );
    }
    $nx = $datos_clouds[$systemId];
    $clip->mkv_url = $getMkvUrls(
        nx: $nx,
        deviceId: $deviceId,
        pos: $clip->pos,
        endPos: $clip->endPos
    );
}

acabarRequest([
    "total" => $cantidad_videos,
    "rows" => $videos
]);
