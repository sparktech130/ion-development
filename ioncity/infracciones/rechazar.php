<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/infracciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_sancion = $jsonobj2->cod_sancion ?? null;
$motivo = $jsonobj2->motivo ?? null;

$rechazo = rechazarInfraccionVehiculo($cod_sancion, $motivo);

if ($rechazo == false){
    http_response_code(500);
}

acabarRequest($rechazo);
