<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/alertas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$alertas_gestion = $jsonobj2->alertas_gestion ?? null;

acabarRequest(eliminarAlertasGestion($alertas_gestion));
