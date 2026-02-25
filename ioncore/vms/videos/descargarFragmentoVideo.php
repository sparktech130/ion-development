<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

$fecha_hora = new DateTime();
$fecha_hora->setTimezone(TIME_ZONE);

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_video = $jsonobj2->cod_video ?? null;
$usuario_compartido = $jsonobj2->usuario_compartido ?? $cod_usuario_token;
$usuario_compartido = obtenerUsuariosParam(
    email: $usuario_compartido,
)[0]->cod_usuario ?? null;

$datos_video = obtenerVideosRecibidos($cod_usuario_token, $cod_video, null, null, null, null, null, true, null, true);
if (!(
    is_array($datos_video)
    && !empty($datos_video)
    && !isset($datos_video["error"])
    && count($datos_video) == 1
)) {
    acabarRequest(["message" => "No se ha podido encontrar el video", "error" => true]);
}

$datos_video = $datos_video[0];

$startTimeMs = $jsonobj2->startTimeMs ?? 0;
$durationMs = $jsonobj2->durationMs ?? 10000; // Duración en milisegundos
$speed = $jsonobj2->speed ?? 1;
$key_fichero = $datos_video->enlace_video ?? null;
$usuario_inicial = $cod_usuario_token;

$email = $jsonobj2->usuario_compartido ?? $email_usuario_token;

if ($startTimeMs > 0 && !$durationMs) {
    acabarRequest([
        "message" => "Duración del video inválida",
        "error" => true
    ]);
} else if (!$key_fichero) {
    acabarRequest([
        "message" => "Video no disponible",
        "error" => true
    ]);
} else if ($startTimeMs == 0 && !$durationMs) {
    $comp = compartirVideoGuardado($cod_video, $email, $usuario_inicial);

    acabarRequest($comp);
}

$key_fichero = explode(".net/", $key_fichero);
$key_fichero = $key_fichero[1];

$titulo = $datos_video->titulo;
$titulo = "Clip de '{$titulo}'";
if (isset($jsonobj2->titulo)) {
    $titulo = $jsonobj2->titulo;
}

$ruta_imagen_insert = $datos_video->imagen;
$cod_modulo = $datos_video->cod_modulo;
$cod_dispositivo = $datos_video->cod_dispositivo;

$velocidad_original = $datos_video->velocidad;

$fecha_hora_compartido = $fecha_hora->format("Y-m-d H:i:s");

acabarRequestSinSalir(["message" => "El clip se está procesando"]);
$video = descargarFragmentoVideo($key_fichero, $startTimeMs, $durationMs, $speed);

$velocidad_insert = $velocidad_original * $speed;

if (isset($video["success"]) && $video["success"] === true) {
    $fecha_hora_caducidad = $video["expireDate"];
    $enlace_video = $video["downloadUrl"];

    $pos = $datos_video->pos + $startTimeMs;
    $endPos = $pos + $durationMs;

    $insert = insertarVideoCompartido(
        $titulo,
        $cod_dispositivo,
        $pos,
        $endPos,
        $usuario_inicial,
        $usuario_compartido,
        $email,
        $fecha_hora_compartido,
        $fecha_hora_caducidad,
        $ruta_imagen_insert ?? null,
        $velocidad_insert,
        $cod_modulo,
        $enlace_video,
        true
    );

    insertarTimelinesVideo($cod_dispositivo, $insert, $pos, $endPos);
}

acabarRequest($video);

function descargarFragmentoVideo($key, $startTimeMs, $durationMs, $speed) {
    $server = NODE_FRAGMENTAR_VIDEOS_URL;
    $postData = [
        "Key" => $key,
        "startTimeMs" => $startTimeMs ?? 0,
        "durationMs" => $durationMs,
        "speed" => $speed ?? 1
    ];

    $respuestaVideo = llamadaCurl(
        $server,
        $postData,
        [
            "Content-Type: application/json",
            "Accept: application/json"
        ],
        true
    );
    if (isset($respuestaVideo["error"]) || $respuestaVideo["headers"]["http_code"] != 200) return false;

    return $respuestaVideo["response"];
}

function compartirVideoGuardado($cod_video, $usuario_compartido, $usuario_inicial) {
    $datos_video = obtenerVideosRecibidos(
        cod_video: $cod_video, 
        enlace_video: true,
        noCaducado: true,
    )[0];
    $datos_usuario_compartido = obtenerUsuariosParam(email: $usuario_compartido);
    $cod_usuario_compartido = $datos_usuario_compartido[0]->cod_usuario ?? null;

    return insertarVideoCompartido(
        $datos_video->titulo,
        $datos_video->cod_dispositivo,
        $datos_video->pos,
        $datos_video->endPos,
        $usuario_inicial,
        $cod_usuario_compartido,
        $usuario_compartido,
        $datos_video->fecha_hora_compartido,
        $datos_video->fecha_hora_caducidad,
        $datos_video->imagen,
        $datos_video->velocidad,
        $datos_video->cod_modulo,
        $datos_video->enlace_video,
        true
    );
}
