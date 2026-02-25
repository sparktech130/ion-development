<?php
use Funciones\NxConnection;

require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$fecha_hora_ini = $jsonobj2->fecha_hora_ini ?? null;
$fecha_hora_fin = $jsonobj2->fecha_hora_fin ?? null;
$limit = $jsonobj2->limit ?? 1000;

$dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);
if (!(!empty($dispositivo) && !isset($dispositivo["error"]) && count($dispositivo) == 1)) {
    acabarRequest([
        "message" => "Dispositivo no encontrado",
        "error" => true
    ], 200);
}

$disp = $dispositivo[0];

$deviceId = $disp->deviceId;
$systemId = $disp->systemId ?? null;
$ip = $disp->ip ?? null;
$puerto = $disp->puerto ?? null;
$user = $disp->user ?? null;
$password = $disp->password ?? null;

$nx = new NxConnection(
    $systemId,
    $ip,
    $puerto,
    $user,
    $password,
);

$eventos = [];

if ($fecha_hora_ini) {
    $from = new DateTime($fecha_hora_ini);
    $from->setTimezone(TIME_ZONE);
    $from = $from->format("Y-m-d\TH:i:s.z");
}

if ($fecha_hora_fin) {
    $to = new DateTime($fecha_hora_fin);
    $to->setTimezone(TIME_ZONE);
    $to = $to->format("Y-m-d\TH:i:s.z");
}

$eventType = [
    "cameraDisconnectEvent",
    "storageFailureEvent",
    "networkIssueEvent",
    "cameraIpConflictEvent",
    "serverFailureEvent",
    "serverConflictEvent",
    "serverStartEvent",
    "licenseIssueEvent",
    "poeOverBudgetEvent",
    "fanErrorEvent",
    "serverCertificateError",
    // "systemHealthEvent",
    // "maxSystemHealthEvent"
];

$eventosNx = $nx->events(
    method: "GET", 
    deviceId: $deviceId, 
    eventType: $eventType, 
    from : $from ?? null, 
    to : $to ?? null,
    limit: $limit,
);

$eventos = [];
if (isset($eventosNx["reply"])) {
    $eventosNx = $eventosNx["reply"];
    foreach ($eventosNx as $key => $evnt) {
        $params = $evnt["eventParams"];

        $timestamp = round($params["eventTimestampUsec"] / 1000000);

        $fecha_hora = new DateTime("@{$timestamp}");
        $fecha_hora->setTimezone(TIME_ZONE);
        $fecha_hora = $fecha_hora->format("Y-m-d H:i:s");

        $eventos[] = [
            "timestamp" => $timestamp,
            "fecha_hora" => $fecha_hora,
            "eventType" => $params["eventType"],
        ];
    }
} else $eventos = $eventosNx;

acabarRequest($eventos);
