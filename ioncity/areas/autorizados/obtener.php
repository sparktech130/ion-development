<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/areas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_area = $jsonobj2->cod_area ?? null;
$matricula = $jsonobj2->matricula ?? null;
$fecha_alta = $jsonobj2->fecha_alta ?? null;
$fecha_baja = $jsonobj2->fecha_baja ?? null;
$observaciones = $jsonobj2->observaciones ?? null;

$rows = obtenerAreaAutorizados(
    cod_area: $cod_area,
    matricula: $matricula,
    fecha_alta: $fecha_alta,
    fecha_baja: $fecha_baja,
    observaciones: $observaciones,
);
$total = obtenerAreaAutorizadosCount();

$returnObj = [
    "rows" => $rows,
    "total" => $total,
];

acabarRequest($returnObj);

