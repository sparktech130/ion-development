<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_lista = $jsonobj2->cod_lista ?? null;
$matricula = $jsonobj2->matricula ?? null;

$rows = obtenerVehiculosListas(
    cod_lista: $cod_lista, 
    matricula: $matricula,
);
$total = obtenerVehiculosListasCount(
    cod_lista: $cod_lista,
);

acabarRequest([
    "rows" => $rows,
    "total" => $total,
]);
