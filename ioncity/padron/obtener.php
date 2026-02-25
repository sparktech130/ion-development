<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/padron/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$matricula = $jsonobj2->matricula ?? null;
$marca = $jsonobj2->marca ?? null;
$modelo = $jsonobj2->modelo ?? null;
$color = $jsonobj2->color ?? null;
$limit = $jsonobj2->limit ?? null;

$rows = obtenerVehiculosPadronParam(
    matricula: $matricula,
    marca: $marca,
    modelo: $modelo,
    color: $color,
    limit: $limit
);
$count = obtenerVehiculosPadronCount();

acabarRequest([
    "total" => $count,
    "rows" => $rows
]);

