<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/padron/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$matricula = $jsonobj2->matricula ?? null;

$marca = $jsonobj2->marca ?? null;
$modelo = $jsonobj2->modelo ?? null;
$color = $jsonobj2->color ?? null;

$fecha_fin_padron = $jsonobj2->fecha_fin_padron ?? null;

$insert = insertarVehiculoPadron(
    matricula: $matricula,
    marca: $marca,
    modelo: $modelo,
    color: $color,
    fecha_fin_padron: $fecha_fin_padron,
);

acabarRequest($insert);

