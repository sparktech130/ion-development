<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/infracciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

if (!isset($jsonobj2->infracciones)) {
    acabarRequest(false, 500);
}

$infracciones = $jsonobj2->infracciones;
$infracciones_a_enviar = obtenerInfraccionesVehiculosPorId($infracciones);

if ($infracciones_a_enviar === false) {
    acabarRequest(false);
}

if (!enviarDiputacion(
    nombre_fichero: "datos.txt",
    datos: $infracciones_a_enviar,
)) {
    acabarRequest(false, 500);
}

acabarRequest(enviarInfraccionesVehiculos($infracciones));

