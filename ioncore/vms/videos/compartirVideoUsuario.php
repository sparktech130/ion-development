<?php

use Firebase\JWT\JWT;
use Funciones\Devices;
use Funciones\NxConnection;

$fmodif = date("Y-m-d_H-i-s", time());

require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$titulo = $jsonobj2->titulo ?? null;
$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$pos = $jsonobj2->pos ?? null;
$durationMs = $jsonobj2->durationMs ?? null;
$usuario_compartido = $jsonobj2->usuario_compartido ?? null;
$cod_modulo = $jsonobj2->cod_modulo ?? null;
$speed = $jsonobj2->speed ?? 1;
$expiry_days = $jsonobj2->expiry_days ?? 2; // [2, 7, 14, 30]
$usuario_inicial = $cod_usuario_token;

$sector = MODULOS[sprintf("%04d", (int)$cod_modulo)]["cod_sector"] ?? null;

if ($sector === null) {
    acabarRequest([
        "message" => "Módulo inválido",
        "error" => true
    ], 200);
}

$route = match ((int)$sector) {
    1 => "city",
    2 => "ski",
    3 => "ionsmartV3",
    4 => "ionsmartV3",
    5 => "ionsmartV3",
    6 => "industry",
};

if (!$cod_dispositivo || !$pos || !$durationMs || !$usuario_compartido || !$cod_modulo) acabarRequest([
    "message" => "Faltan campos para completar la solicitud.",
    "error" => true
]);

$esCorreoValido = esCorreoValido($usuario_compartido);

$datos_usuario_compartido = obtenerUsuariosParam(email: $usuario_compartido);
if (empty($datos_usuario_compartido) || isset($datos_usuario_compartido["error"]) || count($datos_usuario_compartido) != 1) {
    if (!$esCorreoValido)
        acabarRequest([
            "message" => "El mail no es correcto",
            "error" => true
        ], 200);
} else {
    $cod_usuario_compartido = $datos_usuario_compartido[0]->cod_usuario;
}

$dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);
if (!(!empty($dispositivo) && !isset($dispositivo["error"]) && count($dispositivo) == 1)) {
    acabarRequest([
        "message" => "Dispositivo no encontrado",
        "error" => true
    ], 200);
}

if (is_int($pos) && $pos > 0) {
    $timestamp = DateTimeImmutable::createFromFormat('U.u', sprintf('%.6f', $pos / 1000));
    $timestamp->setTimezone(TIME_ZONE);
    $posSearch = $timestamp->getTimestamp();
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

$getThumbnail = function ($pos) use ($nx, $deviceId) {
    if (!isset($pos)) return null;

    $time = new DateTime("@{$pos}");
    $time->setTimezone(TIME_ZONE);
    $time = $time->format('Uu') / 1000;

    $result = Devices::getDeviceThumbnail(
        nx: $nx,
        deviceId: $deviceId,
        time: $time,
        format: "jpg",
    );

    if (
        $result !== null &&
        $result !== false &&
        !isset($result["error"])
    ) {
        return base64_encode($result);
    }
    return $result;
};

$imagen = $getThumbnail($posSearch);

$fecha_hora = new DateTime();
$fecha_hora->setTimezone(TIME_ZONE);
$fecha_hora_compartido = $fecha_hora->format("Y-m-d H:i:s");

$endPos = $pos + $durationMs;

if ($imagen != null) {
    $nombre_imagen = "thmb_{$fmodif}_{$cod_dispositivo}.jpg";

    $ruta_imagen_insert = "vms/videos/miniaturas/{$nombre_imagen}";
    $ruta_imagen = $_SERVER["DOCUMENT_ROOT"] . "/core/{$ruta_imagen_insert}";
}

$insert = insertarVideoCompartido(
    titulo: $titulo,
    cod_dispositivo: $cod_dispositivo,
    pos: $pos,
    endPos: $endPos,
    usuario_inicial: $usuario_inicial,
    usuario_compartido: $cod_usuario_compartido,
    mail_compartido: $usuario_compartido,
    fecha_hora_compartido: $fecha_hora_compartido,
    imagen: $ruta_imagen_insert ?? null,
    velocidad: $speed,
    cod_modulo: $cod_modulo,
    enlace_video: false,
    route: $route,
);

$link_descarga = null;
if ($insert !== false && !isset($insert["error"]) && $imagen != null) {
    GuardarImagenBase64($imagen, $ruta_imagen);
    acabarRequestSinSalir(true);
    insertarTimelinesVideo($cod_dispositivo, $insert, $pos, $endPos);

    $link_descarga = enviarVideoCompartidoNode(
        $insert,
        $getMkvUrl($nx, $deviceId, $pos, $endPos, true),
        $speed,
        $expiry_days
    );
    enviarVideoCompartido(
        cod_video: $insert,
        titulo: $titulo,
        cod_dispositivo: $cod_dispositivo,
        usuario_inicial: $usuario_inicial,
        usuario_compartido: $cod_usuario_compartido,
        cod_modulo: $cod_modulo,
        route: $route,
    );
}

$secretKey = $_ENV["SECRET_KEY"];

$tokenData = [
    'email' => $usuario_compartido
];

$token = JWT::encode($tokenData, $secretKey, 'HS256');

compartirVideoMail([
    "usuario_inicial" => $usuario_inicial,
    "link_descarga" => $link_descarga ? $link_descarga : "{$_ENV['ION_SERVER']}/{$route}?token={$token}",
    "titulo" => $titulo,
    "nom_dispositivo" => $nom_dispositivo,
    "email" => $usuario_compartido
]);
