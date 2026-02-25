<?php
include_once $_SERVER['DOCUMENT_ROOT'] . "/core/dispositivos/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$cod_cloud = $jsonobj2->cod_cloud ?? null;
$modulos = $jsonobj2->modulos ?? null;

$dispositivos = obtenerUltimaImagenDispositivos(
    $cod_dispositivo,
    $cod_cloud,
    $modulos
);

acabarRequest($dispositivos);
