<?php
use Funciones\Devices;
use Funciones\NxConnection;

require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$freeText = $jsonobj2->freeText ?? null;
$sortOrder = $jsonobj2->sortOrder ?? null;
$startTime = $jsonobj2->startTime ?? null;
$endTime = $jsonobj2->endTime ?? null;
$objectTypeId = $jsonobj2->objectTypeId ?? null;
$limit = $jsonobj2->limit ?? null;
$obtenerClip = $jsonobj2->obtenerClip ?? false;
$duracionClip = $jsonobj2->duracionClip ?? 10;

$x1 = $jsonobj2->x1 ?? null;
$y1 = $jsonobj2->y1 ?? null;
$x2 = $jsonobj2->x2 ?? null;
$y2 = $jsonobj2->y2 ?? null;

$dispositivos = obtenerDispositivosDatosCloud(
    cod_dispositivo: $cod_dispositivo
);

$returnObj = [];

$systemId = null;
$cod_cloud = null;

if (!is_array($dispositivos) || empty($dispositivos)) {
    acabarRequest(["message" => "Dispositivo(s) no encontrado(s)", "error" => true, "disp" => $dispositivos]);
}
$disp = $dispositivos[0];

$systemId = $disp->systemId;
$user = $disp->user;
$password = $disp->password;
$ip = $disp->ip;
$puerto = $disp->puerto;

if ($systemId == null) {
    acabarRequest(["message" => "No se ha podido acceder al cloud", "error" => true, "disp" => $dispositivos]);
}

$deviceId = $disp->deviceId ?? null;
if ($deviceId == null) {
    http_response_code(500);
    $returnObj = json_encode(["message" => "Dispositivo(s) no encontrado(s)", "error" => true]);
} 

if ($startTime != null) {
    if (isValidDateTime($startTime)) {
        $dateTime = new DateTime($startTime);
        $dateTime->setTimezone(TIME_ZONE);
        $startTime = $dateTime->getTimestamp() * 1000;
    } else {
        $startTime = null;
    }
}

if ($endTime != null) {
    if (isValidDateTime($endTime)) {
        $dateTime = new DateTime($endTime);
        $dateTime->setTimezone(TIME_ZONE);
        $endTime = $dateTime->getTimestamp() * 1000;
    } else {
        $endTime = null;
    }
}

$nx = new NxConnection(
    systemId: $systemId,
    ip: $ip,
    puerto: $puerto,
    user: $user,
    password: $password,
);

$datosReconocimiento = Devices::objectTrack(
    nx: $nx,
    deviceId: $deviceId,
    freeText: $freeText,
    startTime: $startTime,
    endTime: $endTime,
    objectTypeId: $objectTypeId,
    sortOrder: $sortOrder,
    limit: $limit,
    x1: $x1,
    y1: $y1,
    x2: $x2,
    y2: $y2,
    assoc: false,
);

if (!(is_array($datosReconocimiento) && !empty($datosReconocimiento))) {
    acabarRequest($datosReconocimiento);
}
$vehiculosReconocidos = [];
$matriculas = [];

$allUrls = Devices::getNxStreamingUrl(
    nx: $nx,
    deviceId: $deviceId,
    pos: $pos,
    durationMs: $duration,
);
[$mkv_url, $_] = $allUrls;

foreach ($datosReconocimientoDecode as $recon) {
    $pos = $recon->firstAppearanceTimeUs;
    $recon->mkv_clip = [
        "default" => "$mkv_url",
        "low" => "$mkv_url&stream=1",
        "high" => "$mkv_url&stream=0"
    ];

    if ($recon->objectTypeId == "nx.milesight.LicensePlate") {
        $fotop = $recon->bestShot->image->imageData ?? null;
        $datosReconocimientoFiltrados = [];
        $datosReconocimientoFiltrados["timestamp"] = $pos;

        foreach ($recon->attributes as $key => $attribute) {
            $name = $attribute->name;
            $value = $attribute->value;

            if ($name == "License Plate.Number" || $name == "Number") {
                $filter = array_filter($matriculas, function ($vehiculo) use ($value) {
                    // var_dump($vehiculo);
                    if ($vehiculo["matricula"] == $value) {
                        return $vehiculo;
                    }
                });
                $filter = array_values($filter);

                // echo "{$recon->objectTypeId} --> " . json_encode($filter) . "\n";

                if (empty($filter)) {
                    $posicionVehiculoReconocido = count($vehiculosReconocidos);

                    $datosMatricula = [
                        "matricula" => $value,
                        "position" => $posicionVehiculoReconocido
                    ];

                    $matriculas[] = $datosMatricula;
                    $datosReconocimientoFiltrados["matricula"] = $value;
                } else {
                    $posicionVehiculoReconocido = $filter[0]['position'];
                }
            } else if ($name == "License Plate.Country" || $name == "Country" && isset($pais)) {
                $pais = strtolower($value);
                $datosReconocimientoFiltrados["pais"] = $pais;
            } else if ($name == "Color" && $value !== null) {
                $color = strtolower($value);
                $datosReconocimientoFiltrados["color"] = $color;
            }
        }

        $datosReconocimientoFiltrados["fotop"] = $fotop;

        if (isset($vehiculosReconocidos[$posicionVehiculoReconocido])) {
            $datosReconocimientoFiltrados = array_merge($vehiculosReconocidos[$posicionVehiculoReconocido], $datosReconocimientoFiltrados);
        }

        $vehiculosReconocidos[$posicionVehiculoReconocido] = $datosReconocimientoFiltrados;
    } else if (
        $recon->objectTypeId == "nx.milesight.Vehicle"
            || $recon->objectTypeId == "nx.milesight.Bus"
            || $recon->objectTypeId == "nx.milesight.Car"
            || $recon->objectTypeId == "nx.milesight.Truck"
    ) {
        $foto = $recon->bestShot->image->imageData ?? null;
        $posicionVehiculoReconocido = null;

        foreach ($recon->attributes as $key => $attribute) {
            $name = $attribute->name;
            $value = $attribute->value;

            if ($name == "License Plate.Number" || $name == "Number") {
                $filter = array_filter($matriculas, function ($vehiculo) use ($value) {
                    if ($vehiculo["matricula"] == $value) {
                        return $vehiculo;
                    }
                });
                $filter = array_values($filter);

                if (empty($filter)) {
                    $posicionVehiculoReconocido = count($vehiculosReconocidos);

                    $datosMatricula = [
                        "matricula" => $value,
                        "position" => $posicionVehiculoReconocido
                    ];

                    $matriculas[] = $datosMatricula;
                    $datosReconocimientoFiltrados["matricula"] = $value;
                } else {
                    $posicionVehiculoReconocido = $filter[0]['position'];
                }
            } else if ($name == "License Plate.Country" || $name == "Country") {
                $pais = strtolower($value);

                $datosReconocimientoFiltrados["pais"] = $pais;
            } else if ($name == "Color" && $value !== null) {
                $color = strtolower($value);

                $datosReconocimientoFiltrados["color"] = $color;
            } else if ($name == "Type" && $value !== null) {
                $type = strtolower($value);

                $datosReconocimientoFiltrados["type"] = $type;
            } else if ($name == "Direction" && $value !== null) {
                $direction = strtolower($value);

                if ($direction === "incoming") {
                    $direction = "Approach";
                } else if ($direction === "outgoing") {
                    $direction = "Away";
                }

                $datosReconocimientoFiltrados["direction"] = $direction;
            } else if ($name == "Speed" && $value !== null) {
                $datosReconocimientoFiltrados["speed"] = (int)$value;
            }
        }
        $timestampUs = $recon->bestShot->timestampUs;

        $datosReconocimientoFiltrados["timestampUs"] = $timestampUs;
        $datosReconocimientoFiltrados["mkv_clip"] = $recon->mkv_clip;
        $datosReconocimientoFiltrados["foto"] = $foto;

        if (isset($vehiculosReconocidos[$posicionVehiculoReconocido])) {
            $datosReconocimientoFiltrados = array_merge(
                $vehiculosReconocidos[$posicionVehiculoReconocido],
                $datosReconocimientoFiltrados,
            );
        }
        $vehiculosReconocidos[$posicionVehiculoReconocido] = $datosReconocimientoFiltrados;
    } else {
        $vehiculosReconocidos[] = $recon;
    }
    $returnObj[] = $recon;
}

$returnObj = array_values($vehiculosReconocidos);

acabarRequest($returnObj);
