<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/fabricantes/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_fabricante = $jsonobj2->cod_fabricante ?? null;

acabarRequest(eliminarFabricantes($cod_fabricante));
