<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";

use Funciones\Devices;
use Funciones\NxConnection;
use Funciones\System;

function crearEventoMovimientoDispositivoNx($cod_dispositivo) {
    $eventType = 'cameraMotionEvent';

    // Obtener deviceId y cloud del dispositivo
    $datos_dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);
    if (empty($datos_dispositivo) || isset($datos_dispositivo['error'])) {
        return false;
    }
    $disp = $datos_dispositivo[0];

    $deviceId = $disp->deviceId ?? null;
    if (!$deviceId) {
        return false;
    }

    $nx = new NxConnection(
        systemId: $disp->systemId ?? null,
        ip: $disp->ip ?? null,
        puerto: $disp->puerto ?? null,
        user: $disp->user ?? null,
        password: $disp->password ?? null,
    );

    $crearEvento = System::crearEventoDispositivoNx(
        nx: $nx, 
        eventType: $eventType, 
        resourceId: $deviceId,
        recieveURL: "ws/nx_events/json_nxEvent.php",
    );

    if ($crearEvento['saveEventRule']['success']) {
        $datos_crearEvento = $crearEvento['saveEventRule']['success'];

        if (isset($datos_crearEvento->id)) {
            modificarDispositivos(
                cod_dispositivo: $cod_dispositivo,
                id_regla_evento: trim($datos_crearEvento->id, '{}')
            );
        }
    }
    return $crearEvento;
}


function crearEventoAnalyticDispositivoNx($cod_dispositivo) {
    $eventType = 'analyticsSdkObjectDetected';

    // Obtener deviceId y datos cloud
    $datos_dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);
    if (empty($datos_dispositivo) || isset($datos_dispositivo['error'])) {
        return false;
    }
    $disp = $datos_dispositivo[0];

    $deviceId = $disp->deviceId ?? null;
    if (!$deviceId) {
        return false;
    }

    $nx = new NxConnection(
        systemId: $disp->systemId ?? null,
        ip: $disp->ip ?? null,
        puerto: $disp->puerto ?? null,
        user: $disp->user ?? null,
        password: $disp->password ?? null,
    );

    $crearEvento = System::crearEventoDispositivoNx(
        nx: $nx, 
        eventType: $eventType, 
        resourceId: $deviceId,
        recieveURL: "core/ws/jsonMlsNx.php",
        eventCondition: json_encode([
            "eventTimestampUsec" => "0",
            "eventType" => $eventType,
            "inputPortId" => "nx.base.LicensePlate",
            "metadata" => [
                "allUsers" => false,
                "level" => ""
            ],
            "omitDbLogging" => false,
            "progress" => 0,
            "reasonCode" => "none"
        ]),
    );

    if ($crearEvento['saveEventRule']['success']) {
        $datos_crearEvento = $crearEvento['saveEventRule']['success'];

        if (isset($datos_crearEvento->id)) {
            modificarDispositivos(
                cod_dispositivo: $cod_dispositivo,
                id_regla_evento: trim($datos_crearEvento->id, '{}')
            );
        }
    }

    return $crearEvento;
}

function getDeviceThumbnail4Times($nx, $deviceId, $baseTime) {
    $format = "png";
    // Tiempos para 2 segundos antes, 1 segundo antes, 1 segundo después y 2 segundos después

    $time = new DateTime("@{$baseTime}");
    $time->setTimezone(TIME_ZONE);
    $interval = DateInterval::createFromDateString("-1 seconds");

    // Sumar el intervalo al objeto DateTime
    date_add($time, $interval);

    $times = [];
    $times[] = $time->format("Uu");

    $time = new DateTime("@{$baseTime}");
    $time->setTimezone(TIME_ZONE);
    $times[] = $time->format("Uu");

    $time = new DateTime("@{$baseTime}");
    $time->setTimezone(TIME_ZONE);
    $interval = DateInterval::createFromDateString("+1 seconds");

    // Sumar el intervalo al objeto DateTime
    date_add($time, $interval);
    $times[] = $time->format("Uu");

    $time = new DateTime("@{$baseTime}");
    $time->setTimezone(TIME_ZONE);
    $interval = DateInterval::createFromDateString("+2 seconds");

    // Sumar el intervalo al objeto DateTime
    date_add($time, $interval);
    $times[] = $time->format("Uu");
    $files = [];

    foreach ($times as $time) {
        $result = Devices::getDeviceThumbnail($nx, $deviceId, $time, $format);
        $files_add = ["file" => $result, "time" => $time];
        if (
            $result !== null &&
                $result !== false &&
                !isset($result["error"])
        ) {
            $files_add = ["file" => base64_encode($result), "format" => $format, "time" => $time];
        }
        $files[] = $files_add;
    }

    return $files;
}

