<?php
use Funciones\Devices;
use Funciones\NxConnection;

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);
$fichero_logs = "vms.log";

$debug = $jsonobj2->debug ?? false;
if (!defined("DEBUG")) {
    define("DEBUG", $debug);
}

require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$periodsType = $jsonobj2->periodsType ?? "recording";
$startTimeMs = $jsonobj2->startTimeMs ?? null;
$endTimeMs = $jsonobj2->endTimeMs ?? null;


if ($startTimeMs != null) {
    $startTimeMsD = $startTimeMs / 1000;
    if ($endTimeMs)
    $endTimeMsD = $endTimeMs / 1000;

    $DateTimeInicio = new DateTime("@{$startTimeMsD}");
    $DateTimeInicio->setTimezone(TIME_ZONE);
    $fecha_ini = $DateTimeInicio->format('Y-m-d H:i:s');

    if (isset($endTimeMsD)) {
        $DateTimeInicio = new DateTime("@{$endTimeMsD}");
        $DateTimeInicio->setTimezone(TIME_ZONE);
    } else {
        $DateTimeInicio = new DateTime;
        $DateTimeInicio->setTimezone(TIME_ZONE);
    }
    $fecha_fin = $DateTimeInicio->format('Y-m-d H:i:s');

    $dias = obtenerDiasEntreFechas($fecha_ini, $fecha_fin);
}

$coordenadas = [];
if (isset($jsonobj2->x1) && isset($jsonobj2->x2) && isset($jsonobj2->y1) && isset($jsonobj2->y2)) {
    $coordenadas = [
        "x1" => $jsonobj2->x1,
        "x2" => $jsonobj2->x2,
        "y1" => $jsonobj2->y1,
        "y2" => $jsonobj2->y2
    ];
}

$datos_dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);
$footages = [];

if (isset($datos_dispositivo["error"]) || !is_array($datos_dispositivo) || empty($datos_dispositivo) || count($datos_dispositivo) > 1) {
    acabarRequest(
        ["message" => "Dispositivo no encontrado o no es único", "error" => true],
        500
    );
}

$disp = $datos_dispositivo[0];
$nx = new NxConnection(
    systemId: $disp->systemId,
    ip: $disp->ip,
    puerto: $disp->puerto,
    user: $disp->user,
    password: $disp->password,
);

if (empty($coordenadas)) {
    $footages = Devices::getThisFootage(
        $nx, $disp->deviceId, $periodsType, $startTimeMs, $endTimeMs, false,
    );
} else {
    $coordenadas = convertirCoordenadasFiltro($coordenadas);

    $footages = Devices::recordedTimePeriods(
        $nx, $disp->deviceId, $periodsType, $startTimeMs, $endTimeMs, $coordenadas,
    );
}

if (
    isset($footages) &&
        is_object($footages) &&
        (
            !isset($footages->error) ||
                $footages->error == 0
        ) && isset($footages->reply)
) {
    $footages = $footages->reply;

    if (!empty($footages)) {
        $footages = $footages[0]->periods;
    }
}
$diasConVideo = [];

if (isset($footages) && is_array($footages)) {
    for ($i = 0; $i < count($footages); $i++) {
        $ftg = $footages[$i];
        $ftg->startTimeSeconds = $ftg->startTimeMs / 1000;

        $DateTimeInicio = new DateTime("@{$ftg->startTimeSeconds}");
        $DateTimeInicio->setTimezone(TIME_ZONE);
        $ftg->fecha_hora_inicio = $DateTimeInicio->format('Y-m-d H:i:s');

        if ($ftg->durationMs > 0) {
            $ftg->durationSeconds = round($ftg->durationMs / 1000, 0, PHP_ROUND_HALF_UP);
            $DateTimeFinal = $DateTimeInicio->modify("+{$ftg->durationSeconds} seconds");
            $ftg->fecha_hora_final = $DateTimeFinal->format('Y-m-d H:i:s');
        } else {
            $DateTimeFinal = new DateTime();
            $DateTimeInicio->setTimezone(TIME_ZONE);
            $ftg->fecha_hora_final = $DateTimeFinal->format('Y-m-d H:i:s');
        }

        $diasConVideo = array_merge($diasConVideo, obtenerDiasEntreFechas($ftg->fecha_hora_inicio, $ftg->fecha_hora_final));
        $footages[$i] = $ftg;
    }
}

$diasConVideoReturn = [];
foreach ($dias as $dia) {
    $diaTieneVideo = [
        "dia" => $dia,
        "video" => false
    ];

    $diaTieneVideo["video"] = array_search($dia, $diasConVideo ?? []) !== false;

    $diasConVideoReturn[] = $diaTieneVideo;
}

acabarRequest($diasConVideoReturn);

function obtenerDiasEntreFechas($fechaInicio, $fechaFin)
{
    $dias = [];
    $fechaActual = strtotime($fechaInicio);
    $fechaFin = strtotime($fechaFin);

    while ($fechaActual <= $fechaFin) {
        $dias[] = date("Y-m-d", $fechaActual);
        // Sumar un día a la fecha actual
        $fechaActual = strtotime("+1 day", $fechaActual);
    }

    return $dias;
}
