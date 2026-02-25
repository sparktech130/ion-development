<?php
require_once __DIR__ . "/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/login.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$DeviceID = $jsonobj2->id ?? null;
$StartTime = $jsonobj2->fecha_hora_ini ?? date("Y-m-d H:i:s", time() - 86_400); // Por defecto hoy menos 1 día
$EndTime = $jsonobj2->fecha_hora_fin ?? date("Y-m-d H:i:s", time());

$stats = fd_obtener_estadisticas(
    DeviceID: $DeviceID,
    StartTime: $StartTime,
    EndTime: $EndTime,
);
$processedStats = procesar_estadisticas($stats);
acabarRequest($processedStats);
