<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_vehic_lista = $jsonobj2->cod_vehic_lista ?? null;

$cod_lista = $jsonobj2->cod_lista ?? null;
$matricula = $jsonobj2->matricula ?? null;
$descripcion_vehiculo = $jsonobj2->descripcion_vehiculo ?? null;

$update = modificarVehiculosListas(
    cod_vehic_lista: $cod_vehic_lista, 
    cod_lista: $cod_lista, 
    matricula: $matricula, 
    descripcion_vehiculo: $descripcion_vehiculo,
);

acabarRequest($update);

