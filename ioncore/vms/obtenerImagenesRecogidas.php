<?php
/* TODO */
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;

$fecha_hora_ini = $jsonobj2->fecha_hora_ini ?? null;
$fecha_hora_fin = $jsonobj2->fecha_hora_fin ?? null;

if (!isset($cod_dispositivo))
    acabarRequest(["message" => "Dispositivo no recibido", "error" => true], 500);

if (!isset($fecha_hora_ini) && !isset($fecha_hora_fin)) {
    acabarRequest(["message" => "Fechas no recibidas", "error" => true], 500);
} else if (isset($fecha_hora_ini) && !isset($fecha_hora_fin)) {
    $fecha_hora_fin = $fecha_hora_ini;
} else if (!isset($fecha_hora_ini) && isset($fecha_hora_fin)) {
    $fecha_hora_ini = $fecha_hora_fin;
} else if ($fecha_hora_ini > $fecha_hora_fin) {
    $f = $fecha_hora_fin;

    $fecha_hora_fin = $fecha_hora_ini;
    $fecha_hora_ini = $f;
}

// Obtener las fechas generadas
$fechas = generarFechasIntermedias($fecha_hora_ini, $fecha_hora_fin, 10);

// Mostrar las fechas generadas
$anterior = 0;
foreach ($fechas as $fecha) {
    $inicio = date_create_from_format("Y-m-d H:i:s", $fecha_hora_ini);
    $fin = date_create_from_format("Y-m-d H:i:s", $fecha);

    $intervalo_segundos = $fin->getTimestamp() - $inicio->getTimestamp();

    $intervalo_segundos_tot = $intervalo_segundos - $anterior;

    $anterior = $intervalo_segundos;
}

$reconocimientos = obtenerReconocimientosImagenesPorFechas($cod_dispositivo, $fechas);
acabarRequest($reconocimientos);
