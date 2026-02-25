<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_video = $jsonobj2->cod_video ?? null;
$usuario_compartido = $cod_usuario_token;

$datos_video = obtenerVideosRecibidos($usuario_compartido, $cod_video);
if (!(
    is_array($datos_video)
    && !empty($datos_video)
    && !isset($datos_video["error"])
    && count($datos_video) == 1
)) {
    acabarRequest(["message" => "No se ha podido eliminar", "error" => true]);
}

acabarRequest(eliminarVideo($cod_video));
