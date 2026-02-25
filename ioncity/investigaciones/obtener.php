<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/investigaciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_investigacion = $jsonobj2->cod_investigacion ?? null;

$nombre_investigacion = $jsonobj2->nombre_investigacion ?? null;

$tipo_analisis = $jsonobj2->tipo_analisis ?? null;

$fecha_ini = $jsonobj2->fecha_ini ?? null;
$fecha_fin = $jsonobj2->fecha_fin ?? null;

$hora_ini = $jsonobj2->hora_ini ?? null;
$hora_fin = $jsonobj2->hora_fin ?? null;

$cod_usuario = $jsonobj2->cod_usuario ?? null;

$estado = $jsonobj2->estado ?? null;

$rows = obtenerInvestigacionesParam(
    cod_investigacion: $cod_investigacion,
    nombre_investigacion: $nombre_investigacion,
    fecha_ini: $fecha_ini,
    fecha_fin: $fecha_fin,
    hora_ini: $hora_ini,
    hora_fin: $hora_fin,
    tipo_analisis: $tipo_analisis,
    cod_usuario: $cod_usuario,
    estado: $estado
);
$count = obtenerInvestigacionesCount();

acabarRequest([
    "count" => $count,
    "rows" => $rows
]);

