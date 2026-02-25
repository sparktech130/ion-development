<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_lista = $jsonobj2->cod_lista ?? null;
$nombre_lista = $jsonobj2->nombre_lista ?? null;
$desc_lista = $jsonobj2->desc_lista ?? null;
$tipo_alerta = $jsonobj2->tipo_alerta ?? null;
$cod_provincia = $jsonobj2->cod_provincia ?? null;
$cod_poblacion = $jsonobj2->cod_poblacion ?? null;
$limit = $jsonobj2->limit ?? null;

$obtenerVehiculos = $jsonobj2->obtenerVehiculos ?? false;

$listas = obtenerListasParam(
    cod_lista: $cod_lista, 
    nombre_lista: $nombre_lista, 
    desc_lista: $desc_lista, 
    tipo_alerta: $tipo_alerta, 
    cod_provincia: $cod_provincia, 
    cod_poblacion: $cod_poblacion,
    limit: $limit,
    obtenerVehiculos: $obtenerVehiculos,
);
$total = obtenerListasCount();

$returnObj = [
    "rows" => $listas,
    "total" => $total,
];

acabarRequest($returnObj);

