<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

use Funciones\NxConnection;

$fmodif = date("Y-m-d_H-i-s", time());

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_video = $jsonobj2->cod_video ?? null;
$titulo = $jsonobj2->titulo ?? null;
$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$pos = $jsonobj2->pos ?? null;
$durationMs = $jsonobj2->durationMs ?? null;
$email = $jsonobj2->email ?? null;
$usuario_inicial = $cod_usuario_token;

if (((!$cod_dispositivo || !$pos || !$durationMs) && !$cod_video) || !$email) acabarRequest([
    "message" => "Faltan campos para completar la solicitud.",
    "error" => true
]);

if ($cod_video) {
    $datos_video = obtenerVideosRecibidos(cod_video: $cod_video);
    if (!(!empty($datos_video) && !isset($datos_video["error"]) && count($datos_video) == 1)) {
        acabarRequest([
            "message" => "Video no encontrado",
            "error" => true
        ], 200);
    }

    $datos_video = $datos_video[0];
    $pos = $datos_video->pos;
    $endPos = $datos_video->endPos;
    $cod_dispositivo = $datos_video->cod_dispositivo;
    $titulo = $datos_video->titulo;
}

$dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);
if (!(!empty($dispositivo) && !isset($dispositivo["error"]) && count($dispositivo) == 1)) {
    acabarRequest([
        "message" => "Dispositivo no encontrado",
        "error" => true
    ], 200);
}

$dispositivo = $dispositivo[0];

$deviceId = $dispositivo->deviceId;
$nom_dispositivo = $dispositivo->nom_dispositivo ?? null;
$systemId = $dispositivo->systemId ?? null;
$ip = $dispositivo->ip ?? null;
$puerto = $dispositivo->puerto ?? null;
$user = $dispositivo->user ?? null;
$password = $dispositivo->password ?? null;

$nx = new NxConnection(
    systemId: $systemId,
    ip: $ip,
    puerto: $puerto,
    user: $user,
    password: $password,
);

if (!isset($endPos))
    $endPos = $pos + $durationMs;

acabarRequest(compartirVideoMail([
    "usuario_inicial" => $usuario_inicial,
    "link_descarga" => $getMkvUrl($nx, $deviceId, $pos, $endPos, true),
    "titulo" => $titulo,
    "nom_dispositivo" => $nom_dispositivo,
    "email" => $email
]));
