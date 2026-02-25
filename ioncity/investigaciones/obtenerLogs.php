<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/investigaciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_investigacion = $jsonobj2->cod_investigacion ?? null;

$fecha_ini = $jsonobj2->fecha_ini ?? null;
$fecha_fin = $jsonobj2->fecha_fin ?? null;
$hora_ini = $jsonobj2->hora_ini ?? null;
$hora_fin = $jsonobj2->hora_fin ?? null;

$cod_usuario = $jsonobj2->cod_usuario ?? null;

$cod_accion = $jsonobj2->cod_accion ?? null;
$desc_accion = $jsonobj2->desc_accion ?? null;

$order = $jsonobj2->order ?? "DESC";
$limit = $jsonobj2->limit ?? null;

$rows = obtenerLogsInvestigacionParam(
    cod_investigacion: $cod_investigacion,
    fecha_ini: $fecha_ini,
    fecha_fin: $fecha_fin,
    hora_ini: $hora_ini,
    hora_fin: $hora_fin,
    cod_usuario: $cod_usuario,
    cod_accion: $cod_accion,
    desc_accion: $desc_accion,
    order: $order,
    limit: $limit
);
$count = obtenerLogsInvestigacionCount(
    cod_investigacion: $cod_investigacion,
);

acabarRequest([
    "count" => $count,
    "rows" => $rows
]);

