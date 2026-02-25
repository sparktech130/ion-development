<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/infracciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$infracciones = $jsonobj2->infracciones ?? [];

$validar = validarInfraccionVehiculo($infracciones);

if ($validar == false){
    http_response_code(500);
}

acabarRequest($validar);
