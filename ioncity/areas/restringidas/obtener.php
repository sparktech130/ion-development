<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/areas/main.php";
$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_area = $jsonobj2->cod_area ?? null;
$nombre_area = $jsonobj2->nombre_area ?? null;
$tipo_area = $jsonobj2->tipo_area ?? null;
$coordenadas = $jsonobj2->coordenadas ?? null;

$rows = obtenerAreaRestringidaParam(
    $cod_area, 
    $nombre_area, 
    $tipo_area, 
    $coordenadas,
);

$total = obtenerAreaRestringidaCount();

$returnObj = [
    "rows" => $rows,
    "total" => $total,
];

acabarRequest($returnObj);

