<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_usuario = $jsonobj2->cod_usuario ?? null;
$entrada = $jsonobj2->entrada ?? null;
$salida = $jsonobj2->salida ?? null;
$cod_sesion = $jsonobj2->cod_sesion ?? null;
$limit = $jsonobj2->limit ?? null;
$accion = $jsonobj2->accion ?? null;
$cod_accion = $jsonobj2->cod_accion ?? null;
$desc_accion = $jsonobj2->desc_accion ?? null;

if (isset($jsonobj2->hora_ini) && isset($jsonobj2->hora_fin)) {
    $hora_ini = $jsonobj2->hora_ini;
    $hora_fin = $jsonobj2->hora_fin;
} else {
    $hora_ini = null;
    $hora_fin = null;
}

if (isset($jsonobj2->fecha_ini) && isset($jsonobj2->fecha_fin)) {
    $fecha_ini = $jsonobj2->fecha_ini;
    $fecha_fin = $jsonobj2->fecha_fin;
} else {
    $fecha_ini = null;
    $fecha_fin = null;
}

acabarRequest(obtenerLogsUsuario(
    cod_usuario: $cod_usuario,
    cod_sesion: $cod_sesion,
    accion: $accion,
    cod_accion: $cod_accion,
    desc_accion: $desc_accion,
    hora_ini: $hora_ini,
    hora_fin: $hora_fin,
    fecha_ini: $fecha_ini,
    fecha_fin: $fecha_fin,
    limit: $limit
));
