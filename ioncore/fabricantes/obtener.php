<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/fabricantes/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_fabricante = $jsonobj2->cod_fabricante ?? null;
$nombre_fabricante = $jsonobj2->nombre_fabricante ?? null;
$descripcion_fabricante = $jsonobj2->descripcion_fabricante ?? null;
$cod_categoria = $jsonobj2->cod_categoria ?? null;

acabarRequest(obtenerFabricantesParam(
    $cod_fabricante, 
    $nombre_fabricante, 
    $descripcion_fabricante, 
    $cod_categoria,
));
