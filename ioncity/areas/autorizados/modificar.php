<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/areas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_autorizado = $jsonobj2->cod_autorizado ?? null;
$cod_area = $jsonobj2->cod_area ?? null;
$matricula = $jsonobj2->matricula ?? null;
$observaciones = $jsonobj2->observaciones ?? null;
$fecha_alta = $jsonobj2->fecha_alta ?? null;
$fecha_baja = $jsonobj2->fecha_baja ?? null;

$update = modificarAreaAutorizados(
    cod_autorizado: $cod_autorizado, 
    cod_area: $cod_area, 
    matricula: $matricula, 
    observaciones: $observaciones, 
    fecha_alta: $fecha_alta, 
    fecha_baja: $fecha_baja,
);

acabarRequest($update);

