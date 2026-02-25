<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_seccion = $jsonobj2->cod_seccion ?? null;
$nombre_seccion = $jsonobj2->nombre_seccion ?? null;
$cod_modulo = $jsonobj2->cod_modulo ?? null;
$cod_sector = $jsonobj2->cod_sector ?? null;
$cod_sector_unico = $jsonobj2->cod_sector_unico ?? null;

acabarRequest(obtenerSeccionesParam(
    cod_seccion: $cod_seccion,
    nombre_seccion: $nombre_seccion, 
    cod_modulo: $cod_modulo,
    cod_sector: $cod_sector,
    cod_sector_unico: $cod_sector_unico,
));

