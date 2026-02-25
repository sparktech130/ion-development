<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/cloud_nx/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);
$cod_cloud = $jsonobj2->cod_cloud ?? null;

$dispositivos = obtenerDispositivosSincronizar($cod_cloud);

acabarRequest($dispositivos);

