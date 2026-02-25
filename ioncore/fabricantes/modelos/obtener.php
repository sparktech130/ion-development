<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/fabricantes/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_modelo = $jsonobj2->cod_modelo ?? null;
$nombre_modelo = $jsonobj2->nombre_modelo ?? null;
$descripcion_modelo = $jsonobj2->descripcion_modelo ?? null;
$cod_fabricante = $jsonobj2->cod_fabricante ?? null;
$cod_categoria = $jsonobj2->cod_categoria ?? null;

acabarRequest(obtenerModelosParam(
    $cod_modelo, 
    $nombre_modelo, 
    $descripcion_modelo, 
    $cod_fabricante, 
    $cod_categoria,
));
