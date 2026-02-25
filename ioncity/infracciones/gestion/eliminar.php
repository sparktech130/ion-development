<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/infracciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_infraccion = $jsonobj2->cod_infraccion ?? null;

acabarRequest(eliminarInfraccion($cod_infraccion));

