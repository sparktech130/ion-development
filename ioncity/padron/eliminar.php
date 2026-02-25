<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/padron/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$matricula = $jsonobj2->matricula ?? null;

$delete = eliminarVehiculoPadron($matricula);

acabarRequest($delete);

