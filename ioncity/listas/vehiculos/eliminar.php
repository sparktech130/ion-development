<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_vehic_lista = $jsonobj2->cod_vehic_lista ?? null;

$delete = eliminarVehiculosListas($cod_vehic_lista);

acabarRequest($delete);

