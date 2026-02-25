<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/dispositivos/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/areas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;

$comp = comprobarAreasDispositivos($cod_dispositivo);

acabarRequest($comp);
