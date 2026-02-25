<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/dispositivos/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;

$velocidadAlertas = obtenerVelocidadAlertasDispositivo($cod_dispositivo);

acabarRequest($velocidadAlertas);

