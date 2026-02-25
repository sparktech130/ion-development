<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$nombre_modulo = $jsonobj2->nombre_modulo ?? null;
$cod_modulo = $jsonobj2->cod_modulo ?? null;
$cod_sector = $jsonobj2->cod_sector ?? null;

acabarRequest(obtenerModulosParam(
    cod_modulo: $cod_modulo,
    nombre_modulo: $nombre_modulo,
    cod_sector: $cod_sector,
));
