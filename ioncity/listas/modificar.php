<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_lista = $jsonobj2->cod_lista ?? null;
$cod_poblacion = $jsonobj2->cod_poblacion ?? null;
$cod_provincia = $jsonobj2->cod_provincia ?? null;
$desc_lista = $jsonobj2->desc_lista ?? null;
$nombre_lista = $jsonobj2->nombre_lista ?? null;
$tipo_alerta = $jsonobj2->tipo_alerta ?? null;

if (
    isset($desc_lista) &&
        ($desc_lista !== "b" || $desc_lista !== "n")
) {
	$desc_lista = "n";
}

$update = modificarLista(
    cod_lista: $cod_lista, 
    cod_poblacion: $cod_poblacion, 
    cod_provincia: $cod_provincia, 
    desc_lista: $desc_lista, 
    nombre_lista: $nombre_lista, 
    tipo_alerta: $tipo_alerta,
);

acabarRequest($update);

