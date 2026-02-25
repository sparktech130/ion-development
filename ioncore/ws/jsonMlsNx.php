<?php

use Funciones\Devices;
use Funciones\NxConnection;

error_reporting(E_ALL & ~E_DEPRECATED);

$time = time();

$fmodif = date("Y-m-d_H-i-s", $time);
$year_month = date("Y-m", $time);
$day = date("d", $time);
$moment = date("His", $time);

$jsonobj = file_get_contents("php://input");
file_put_contents('post_mls_detect_nx.json', $jsonobj);

$array = json_decode($jsonobj, true);

$debug = $array['debug'] ?? false;

if (!defined("DEBUG")) {
    define("DEBUG", $debug);
}

$_SESSION["AUTHED"] = false;
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/consts.php';
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/utils/main.php";
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/reconocimientos/main.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/dispositivos/main.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/utils/notificaciones.php';
include_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/alertas/main.php"; // opcional
include_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/listas/main.php"; // para destinatarios

if (!isset($array["deviceId"])) {
    EscribirLog(
        "ERROR: deviceId no recibido: {$jsonobj}",
        "error",
    );
}

$deviceId = trim($array["deviceId"] ?? $array["deviceID"], '{}');

$dispositivo = obtenerDispositivosDatosCloud(deviceId: $deviceId);
if (empty($dispositivo) || (isset($dispositivo["error"]) && $dispositivo["error"] === true)) {
    EscribirLog(
        "ERROR: No se ha encontrado el dispositivo en nuestra base de datos.",
        "error",
    );
    acabarRequest(false);
}

$disp = $dispositivo[0];
if (!isset($disp->cod_dispositivo)) {
    acabarRequest(["message" => "No se ha encontrado el dispositivo", "error" => true], 404);
}

if (!isset($disp->cod_cloud)) {
    acabarRequest(["message" => "No se ha encontrado el cloud", "error" => true], 404);
}

$cod_dispositivo = $disp->cod_dispositivo;
if (!dispositivoTieneModulos($cod_dispositivo)) {
    EscribirLog(
        "Dispositivo {$cod_dispositivo} ({$nom_dispositivo}) - El dispositivo no tiene los módulos necesarios",
    );
    acabarRequest([
        "message" => "El dispositivo no tiene los módulos necesarios",
        "error" => true,
    ]);
}

$nom_dispositivo = $disp->nom_dispositivo;
$systemId = $disp->systemId;
$username = $disp->user;
$password = $disp->password;
$dispositivo = $disp;

$nx = new NxConnection(
    systemId: $disp->systemId,
    ip: $disp->ip,
    puerto: $disp->puerto,
    user: $disp->user,
    password: $disp->password,
);

$modulos = obtenerModulosDispositivosParam(cod_dispositivo: $disp->cod_dispositivo);

$modulos_disp = "";
foreach ($modulos as $mod) {
    $modulos_disp .= $mod->cod_modulo . ";";
}
$modulos_disp = rtrim($modulos_disp, ";");

$datosReconocimiento = Devices::objectTrack(
    nx: $nx,
    deviceId: $deviceId,
    startTime: $time,
    sortOrder: "desc",
    limit: 2,
    assoc: false,
);
$returnObj = [];
$mkv_clip = [];

if (!is_array($datosReconocimiento)) {
    EscribirLog(
        "ERROR: No se ha encontrado el reconocimiento para {$nom_dispositivo}.",
        "error",
    );
    acabarRequest(false);
}

$urls = Devices::getNxStreamingUrl(
    nx: $nx,
    deviceId: $deviceId,
);
[$mkv_url, $mp4_url] = $urls;
$matricula = null;
$pais = '';

$reconocimientoArray = [
    $datosReconocimiento[0] ?? (object)[],
    $datosReconocimiento[1] ?? (object)[],
];

// Apaño matricula se cuela
foreach ($reconocimientoArray as $recon) {
    $objectTypeId = $recon->objectTypeId ?? null;
    if (!$objectTypeId) {
        continue;
    }
    $pos = $recon->firstAppearanceTimeUs ?? null;
    $duration = 4;
    $mkv_clip = [
        "low" => "$mkv_url&pos=$pos&duration=$duration&stream=1",
        "high" => "$mkv_url&pos=$pos&duration=$duration&stream=0",
        "default" => "$mkv_url&pos=$pos&duration=$duration"
    ];

    if ($objectTypeId == "nx.milesight.LicensePlate") {
        $fotop = $recon->bestShot->image->imageData ?? null;

        foreach ($recon->attributes as $key => $attribute) {
            $name = $attribute->name;
            $value = $attribute->value;

            if ($name == "License Plate.Number" || $name == "Number" && $matricula != null) {
                $matricula = $value;
            } else if ($name == "License Plate.Country" || $name == "Country" && $pais != null) {
                $pais = strtolower($value);
            } else if ($name == "Speed" && $value !== null) {
                $velocidad_vehiculo = strtolower($value);
            }
        }
    } else if (
        $objectTypeId == "nx.milesight.Vehicle"
        || $objectTypeId == "nx.milesight.Bus"
        || $objectTypeId == "nx.milesight.Car"
        || $objectTypeId == "nx.milesight.Truck"
        || $objectTypeId == "nx.milesight.Bike"
    ) {
        $foto = $recon->bestShot->image->imageData ?? null;

        foreach ($recon->attributes as $key => $attribute) {
            $name = $attribute->name;
            $value = $attribute->value;

            if ($name == "License Plate.Number" || $name == "Number") {
                $matricula = $value;
            } else if ($name == "License Plate.Country" || $name == "Country") {
                $pais = strtolower($value);
            } else if ($name == "Color" && $value !== null) {
                $color = strtolower($value);
            } else if ($name == "Speed" && $value !== null) {
                $velocidad_vehiculo = strtolower($value);

                if ($velocidad_vehiculo == 65535) {
                    $velocidad_vehiculo = 0;
                }
            } else if ($name == "Direction" && $value !== null) {
                $orientacion = $value;

                $orientacion = match ($orientacion) {
                    "Outgoing" => "Away",
                    "Incoming" => "Approach",
                    default => ""
                };
            }
        }
        $timestampUs = $recon->bestShot->timestampUs;
    }
    $returnObj[] = $recon;
}

$nombre_foto = null;
$nombre_fotop = null;
$subDir = "{$year_month}/{$day}";

if (isset($foto) && isset($fotop)) {
    $foto = trim($foto);
    $fotop = trim($fotop);

    $nombre_foto = sprintf("%s/%s_%s.jpg", $subDir, $moment, $matricula);
    $nombre_fotop = sprintf("%s/%s_%sp.jpg", $subDir, $moment, $matricula);
}

if (!isset($matricula)) {
    EscribirLog(
        "WARNING: No se ha encontrado matricula para {$nom_dispositivo}.",
        /* "error", */
    );
    acabarRequest(false);
}

$fecha = date("Y-m-d", time());
$hora = date("H:i:s", time());

$comprobacionMatricula = obtenerReconocimientosMatricula(
    matricula: $matricula,
    cod_dispositivo: $cod_dispositivo,
);

$diferenciaSegundos = 0;

if (!isset($comprobacionMatricula['error']) && !empty($comprobacionMatricula)) {
    $comprobacionMatricula = $comprobacionMatricula[0];
    $fechaHoraComprobacion = $comprobacionMatricula->fecha . " " . $comprobacionMatricula->hora;
    $fechaInicio = new DateTime("$fecha $hora");
    $fechaInicio->setTimezone(TIME_ZONE);
    $fechaFin = new DateTime($fechaHoraComprobacion);
    $fechaFin->setTimezone(TIME_ZONE);

    // Calcular la diferencia en segundos
    $diferenciaSegundos = abs($fechaFin->getTimestamp() - $fechaInicio->getTimestamp());

    if ($diferenciaSegundos <= 30) {
        EscribirLog(
            "WARNING: Reconocimiento no insertado para matrícula '$matricula', ultimo registro hace $diferenciaSegundos segundos."
        );
        acabarRequest(["message" => "La diferencia es menor a 30 segundos.", "error" => true]);
    }
} else if (isset($comprobacionMatricula['error'])) {
    EscribirLog(
        "ERROR: Error al comprobar matrícula '$matricula': " . json_encode($comprobacionMatricula),
    );
}

EscribirLog(
    "Se insertará reconocimiento con matrícula '$matricula' " . $diferenciaSegundos . " segundos.",
);

$matr_correcta = comprobarMatricula($matricula);
if (!$matr_correcta) {
    acabarRequest([
        "message" => "Matrícula inválida: {$matricula}",
        "error" => true,
    ]);
}

$cod_alertagest = "";

if (!isset($velocidad_vehiculo)) {
    $velocidad_vehiculo = '';
}
$velocidad_max_operacion = null;

$included = include_once $_SERVER['DOCUMENT_ROOT'] . '/ioncity/dispositivos/main.php';
if ($included && function_exists("obtenerVelocidadAlertasDispositivo")) {
    $velocidad_max_operacion = obtenerVelocidadAlertasDispositivo($cod_dispositivo)[0]->velocidad_max ?? null;
}

if (
    $velocidad_max_operacion != null && $velocidad_vehiculo != null
    && $velocidad_max_operacion != "" && $velocidad_vehiculo != ""
) {
    if ((int) $velocidad_vehiculo > (int) $velocidad_max_operacion) {
        $cod_alertagest .= "0001;"; // Alerta exceso de velocidad
    }
}

// Comprobar matrícula contra todas las listas (negras y blancas)
if (function_exists("comprobarMatriculaContraTodasListas")) {
    $listas_alertar = comprobarMatriculaContraTodasListas($matricula);

    if (!empty($listas_alertar)) {
        foreach ($listas_alertar as $lista) {
            $cod_alertagest .= "{$lista->tipo_alerta};";
            EscribirLog(
                "Alerta de lista: {$lista->nombre_lista} ({$lista->motivo}) - Tipo: {$lista->tipo_alerta}",
                "info"
            );
        }
    }
}

$alertas_area = [];
if (function_exists("obtenerAlertasAreaMatricula")) {
    $alertas = obtenerAlertasAreaMatricula(
        matricula: $matricula,
        cod_dispositivo: $cod_dispositivo,
    );

    if ($alertas && is_array($alertas) && !isset($alertas["error"])) {
        foreach ($alertas as $a) {
            $alertas_area[$a["cod_alertagest"]] = $a["cod_area"];
            $cod_alertagest .= $a["cod_alertagest"] . ";";
        }
    }
}

if (!isset($orientacion))
    $orientacion = $array["direction"] ?? '';

$confidence = $array["confidence"] ?? '';

if (!isset($tipo_vh))
    $tipo_vh = $array["vehicle_type"] ?? $array["vehicle type"] ?? '';

if (!isset($color))
    $color = '';

$incidencia = '';
$marca = '';

$modelo = '';
$estado = '';
$distintivo = '';
$latitud = '';
$longitud = '';
$cod_provincia = '03';
$cod_poblacion = '000004';

if (!isset($foto)) {
    EscribirLog(
        "ERROR: Error al insertar reconocimiento de '$matricula': Foto no recibida.",
        "error"
    );
    acabarRequest(false);
}

if ($cod_alertagest !== null && $cod_alertagest !== "") {
    $cod_alertagest = rtrim($cod_alertagest, ";");
}

$insert = insertarReconocimientos(
    cod_provincia: $cod_provincia,
    cod_poblacion: $cod_poblacion,
    fecha: $fecha,
    hora: $hora,
    matricula: $matricula,
    pais: $pais,
    confidence: $confidence,
    foto: $nombre_foto,
    fotop: $nombre_fotop,
    incidencia: $incidencia,
    cod_dispositivo: $cod_dispositivo,
    fecha_modif: $fmodif,
    marca: $marca,
    modelo: $modelo,
    color: $color,
    tipo_vh: $tipo_vh,
    estado: $estado,
    distintivo: $distintivo,
    velocidad_vehiculo: $velocidad_vehiculo,
    latitud: $latitud,
    longitud: $longitud,
    orientacion: $orientacion,
    cod_alertagest: $cod_alertagest,
    cod_modulo: $modulos_disp,
    llamarNode: true
);

if (!$insert || isset($insert["error"])) {
    EscribirLog(
        sprintf("ERROR: Dispositivo {$cod_dispositivo} ({$nom_dispositivo}) - %s", isset($insert["message"]) ? $insert["message"] : ""),
        "error",
    );
    acabarRequest([
        "insert" => $insert,
        "campos" => [
            "cod_provincia" => $cod_provincia,
            "cod_poblacion" => $cod_poblacion,
            "fecha" => $fecha,
            "hora" => $hora,
            "matricula" => $matricula,
            "pais" => $pais,
            "confidence" => $confidence,
            "nombre_foto" => $nombre_foto,
            "nombre_fotop" => $nombre_fotop,
            "incidencia" => $incidencia,
            "cod_dispositivo" => $cod_dispositivo,
            "fmodif" => $fmodif,
            "marca" => $marca,
            "modelo" => $modelo,
            "color" => $color,
            "tipo_vh" => $tipo_vh,
            "estado" => $estado,
            "distintivo" => $distintivo,
            "velocidad_vehiculo" => $velocidad_vehiculo,
            "latitud" => $latitud,
            "longitud" => $longitud,
            "orientacion" => $orientacion,
            "cod_alertagest" => $cod_alertagest,
        ]
    ]);
}

// Guardar imagenes
$imagesDir = $_SERVER['DOCUMENT_ROOT'] . "/core/fotos";
if (!file_exists("{$imagesDir}/{$subDir}")) {
    mkdir(
        directory: "{$imagesDir}/{$subDir}",
        permissions: 0775, // Usuario: rwx, Grupo: rwx, Otros: r (Read - 4, Write - 2, Execute - 1)
        recursive: true,
    );
}

$nom_img = null;
$nom_imgp = null;
if (isset($foto) && isset($nombre_foto)) {
    $Base64Img = $foto;

    $Base64Img = base64_decode($Base64Img);

    $nom_img = sprintf("%s/%s", $imagesDir, $nombre_foto);
    try {
        file_put_contents($nom_img, $Base64Img);

        optimizarImagen(
            ruta_original: $nom_img,
            ruta_guardar: $nom_img,
            calidad: 20,
        );
    } catch (Exception $e) {
        EscribirLog(
            "Error al guardar imagen {$nom_img}. {$e->getMessage()}",
            "error",
        );
    }
}

if (isset($fotop) && isset($nombre_fotop)) {
    $Base64Imgp = $fotop;

    $Base64Imgp = base64_decode($Base64Imgp);

    $nom_imgp = sprintf("%s/%s", $imagesDir, $nombre_fotop);
    try {
        file_put_contents($nom_imgp, $Base64Imgp);
    } catch (Exception $e) {
        EscribirLog(
            "Error al guardar imagen {$nom_imgp}. {$e->getMessage()}",
            "error",
        );
    }
}


if (
    $insert !== false &&
    $cod_alertagest !== null &&
    $cod_alertagest != "" &&
    function_exists("obtenerAlertasGestionParam")
) {
    $alertas = [];

    $cod_alertagest = explode(";", $cod_alertagest);
    for ($ag = 0; $ag < count($cod_alertagest); $ag++) {
        $alertagest = $cod_alertagest[$ag];

        $alerta_gestion = obtenerAlertasGestionParam(
            cod_alertagest: $alertagest,
        );
        $alerta = ["modulo" => ""];

        if (empty($alerta_gestion)) {
            continue;
        }
        $alerta_gestion = $alerta_gestion[0];

        $incidencia = $alerta_gestion->nombre_alerta;
        $alerta["modulo"] = $alerta_gestion->nombre_modulo;

        $cod_alerta = insertarAlerta(
            cod_reconoc: $insert,
            matricula: $matricula,
            incidencia: $incidencia,
            cod_dispositivo: $cod_dispositivo,
            fecha: $fecha,
            hora: $hora,
            estat: "p",
            f_modif: $fmodif,
            imagen: "fotos/$nombre_foto",
            cod_alertagest: $alertagest,
            cod_area: $alertas_area[$alertagest] ?? null,
        );

        $alerta['cod'] = $cod_alerta;

        $alertas[] = $alerta;
    }

    if (!empty($alertas)) {
        enviarAlertaSocket($alertas);
    }
}

// Notificar a destinatarios de listas si la matrícula está en alguna lista
if (function_exists("obtenerDestinatariosPorMatricula")) {
    try {
        $destinatarios = obtenerDestinatariosPorMatricula($matricula);

        if (!empty($destinatarios) && is_array($destinatarios) && !isset($destinatarios['error'])) {
            EscribirLog(
                "Se encontraron " . count($destinatarios) . " destinatarios para la matrícula {$matricula}"
            );

            $datosReconocimiento = [
                'matricula' => $matricula,
                'nom_dispositivo' => $nom_dispositivo,
                'cod_dispositivo' => $cod_dispositivo,
                'fecha' => $fecha,
                'hora' => $hora,
                'foto' => $nombre_foto ?? null,
                'fotop' => $nombre_fotop ?? null,
                'pais' => $pais,
                'velocidad' => $velocidad_vehiculo ?? null,
                'marca' => $marca ?? '',
                'color' => $color ?? '',
            ];

            $resultadosNotificaciones = enviarNotificacionLista($datosReconocimiento, $destinatarios);

            EscribirLog(
                "Notificaciones procesadas para matrícula {$matricula}: " .
                    json_encode($resultadosNotificaciones)
            );
        }
    } catch (Exception $e) {
        EscribirLog(
            "Error al procesar notificaciones de lista para {$matricula}: {$e->getMessage()}",
            "error"
        );
    }
}

acabarRequest($insert);
