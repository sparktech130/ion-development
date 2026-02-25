<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/dispositivos/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$velocidad_max = $jsonobj2->velocidad_max ?? null;
$cod_infraccion = $jsonobj2->cod_infraccion ?? null;

if ($velocidad_max == 0) {
    $clear = eliminarVelocidadAlertasDispositivo($cod_dispositivo);

    acabarRequest($clear);
} 

$update = modificarVelocidadAlertasDispositivo(
    cod_dispositivo: $cod_dispositivo, 
    velocidad_max: $velocidad_max, 
    cod_infraccion: $cod_infraccion,
);

acabarRequest($update);


