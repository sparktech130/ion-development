<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/fabricantes/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_categoria = $jsonobj2->cod_categoria ?? null;
$nombre_categoria = $jsonobj2->nombre_categoria ?? null;
$cod_sector = $jsonobj2->cod_sector ?? null;

acabarRequest(obtenerCategorias(
    $cod_categoria, 
    $nombre_categoria,
    $cod_sector,
));

