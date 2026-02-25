<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$nombre_usuario = $jsonobj2->nombre_usuario ?? null;
$ip = $jsonobj2->ip ?? null;
$limit = $jsonobj2->limit ?? null;

if (isset($jsonobj2->fecha_ini) && isset($jsonobj2->fecha_fin)) {
    $fecha_ini = $jsonobj2->fecha_ini;
    $fecha_fin = $jsonobj2->fecha_fin;
} else {
    $fecha_ini = null;
    $fecha_fin = null;
}

acabarRequest(obtenerSesionesLogUsuario(
    nombre_usuario: $nombre_usuario, 
    ip: $ip, 
    fecha_ini: $fecha_ini, 
    fecha_fin: $fecha_fin, 
    limit: $limit,
));
