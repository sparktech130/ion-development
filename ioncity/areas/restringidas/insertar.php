<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/areas/main.php";
$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$nombre_area = $jsonobj2->nombre_area ?? null;
$tipo_area = $jsonobj2->tipo_area ?? null;
$cod_infraccion = $jsonobj2->cod_infraccion ?? null;
$coordenadas = $jsonobj2->coordenadas ?? null;

$insert = insertarAreaRestringida(
    nombre_area: $nombre_area, 
    tipo_area: $tipo_area, 
    cod_infraccion: $cod_infraccion,
    coordenadas: $coordenadas,
);

acabarRequest($insert);


