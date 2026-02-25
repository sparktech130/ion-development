<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/areas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_autorizado = $jsonobj2->cod_autorizado ?? null;

$delete = eliminarAreaAutorizados($cod_autorizado);

acabarRequest($delete);

