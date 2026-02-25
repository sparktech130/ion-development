<?php
$_SESSION["AUTHED"] = false;

require_once $_SERVER['DOCUMENT_ROOT'] . '/core/consts.php';
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/utils/main.php";
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/dispositivos/main.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/reconocimientos/main.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/utils/notificaciones.php';
include_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/alertas/main.php"; // opcional
include_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/listas/main.php"; // para destinatarios

error_reporting(E_ALL & ~E_DEPRECATED);

$time = time();

$fmodif = date("Y-m-d_H-i-s", $time);
$year_month = date("Y-m", $time);
$day = date("d", $time);
$moment = date("His", $time);

$jsonobj = file_get_contents("php://input");

$array = json_decode($jsonobj, true);

$debug = $array['debug'] ?? false;

if (!defined("DEBUG")) {
    define("DEBUG", $debug);
}
$returnObj = [];

/*****************MILESIGHT*************/
if (isset($array["device"])) {
    $dispositivo = obtenerDispositivos(nom_dispositivo: $array["device"]);

    if (!isset($dispositivo[0]->cod_dispositivo)) {
        echo json_encode(false);
        EscribirLog(
            "Falla en {$array["device"]}: No encontrado",
            "error"
        );
        exit();
    }

    $cod_dispositivo = $dispositivo[0]->cod_dispositivo;
    $nom_dispositivo = $dispositivo[0]->nom_dispositivo;
} else {
    /* EscribirLog(json_encode($array, JSON_UNESCAPED_SLASHES), "error"); */
    file_put_contents("./post_jsonMls.json", json_encode($array, JSON_PRETTY_PRINT));
    acabarRequest([]);
}

if (!dispositivoTieneModulos($cod_dispositivo)) {
    EscribirLog(
        "Dispositivo {$cod_dispositivo} ({$nom_dispositivo}) - El dispositivo no tiene los módulos necesarios",
    );
    acabarRequest([
        "message" => "El dispositivo no tiene los módulos necesarios",
        "error" => true,
    ]);
}

$fecha0 = "";
if (isset($array["time"])) {
    $fecha0 = $array["time"];
}

$fecha = substr($fecha0, 0, 10);
$hora = substr($fecha0, 11, 8);

$matricula = $array["plate"] ?? $array["license plate"] ?? "";

EscribirLog(
    "Reconocimiento para [$cod_dispositivo] - $nom_dispositivo: '$matricula'"
);

if (
    !$matricula ||
    in_array(
        needle: strtolower($matricula),
        haystack: ["no plates", "", " ", "-"],
    )
) {
    file_put_contents("./post_jsonMls.json", json_encode($array, JSON_PRETTY_PRINT));
    acabarRequest([
        "message" => "Matrícula no recibida",
        "error" => true,
    ]);
}
/* $matr_correcta = comprobarMatricula($matricula); */
/**/
/* if ($matr_correcta == false) { */
/*     EscribirLog( */
/*         "Matrícula incorrecta: ({$matricula})", */
/*         "error" */
/*     ); */
/*     acabarRequest(["message" => "La matrícula es incorrecta ({$matricula})"]); */
/* } */

$pais = strtolower($array["region"] ?? $array["country/region"] ?? "");

$velocidad_vehiculo = trim($array["speed"] ?? "", "-km/h") ?? '';

$orientacion = $array["direction"] ?? '';

$confidence = $array["confidence"] ?? '';

$tipo_vh = $array["vehicle_type"] ?? $array["vehicle type"] ?? '';

$color = $array["vehicle_color"] ?? $array["vehicle color"] ?? '';
if ($color != null)
    $color = strtolower($color);

if (!isset($array["plate_image"]) || !isset($array["full_image"])) {
    file_put_contents("./post_jsonMls.json", json_encode($array, JSON_PRETTY_PRINT));
}
$fotop = $array["plate_image"] ?? "";
$foto = $array["full_image"] ?? "";

$subDir = "{$year_month}/{$day}";

if (isset($foto) && isset($fotop)) {
    $foto = trim($foto);
    $fotop = trim($fotop);

    $nombre_foto = sprintf("%s/%s_%s.jpg", $subDir, $moment, $matricula);
    $nombre_fotop = sprintf("%s/%s_%sp.jpg", $subDir, $moment, $matricula);
}

$incidencia = '';
$marca = $array["vehicle brand"] ?? $array["vehicle_brand"] ?? $array["Vehicle Brand"] ?? '';

$modelo = '';
$estado = '';
$distintivo = '';
$cod_alertagest = "";

$latitud = $array["coordinate_x1"] ?? '';
$longitud = $array["coordinate_y1"] ?? '';

$cod_provincia = '03';
$cod_poblacion = '000004';

$comprobacionMatricula = obtenerReconocimientosMatricula(
    matricula: $matricula,
    cod_dispositivo: $cod_dispositivo,
);

if (!isset($comprobacionMatricula['error']) && !empty($comprobacionMatricula)) {
    $comprobacionMatricula = $comprobacionMatricula[0];
    $fechaHoraComprobacion = $comprobacionMatricula->fecha . " " . $comprobacionMatricula->hora;

    $fechaInicio = new DateTime("$fecha $hora");
    $fechaInicio->setTimezone(TIME_ZONE);
    $fechaFin = new DateTime($fechaHoraComprobacion);
    $fechaFin->setTimezone(TIME_ZONE);

    // Calcular la diferencia en segundos
    $diferenciaSegundos = abs($fechaFin->getTimestamp() - $fechaInicio->getTimestamp());
    /* $diferenciaSegundos = $fechaInicio->diff($fechaFin)->s; */

    if ($diferenciaSegundos <= 30) {
        EscribirLog(
            "Comprobación fallida para {$matricula}, diferenciaSegundos: {$diferenciaSegundos}",
        );
        acabarRequest([
            "comprobacionMatricula" => $comprobacionMatricula,
            "diferenciaSegundos" => $diferenciaSegundos,
            "fechaIni" => $fechaInicio,
            "fechaFin" => $fechaFin,
            "msg" => "La diferencia es menor a 30 segundos."
        ]);
    }
} else if (isset($comprobacionMatricula['error'])) {
    EscribirLog(
        "Comprobación fallida para {$matricula}, comprobacionMatricula: {$comprobacionMatricula}",
    );
    acabarRequest([
        "comprobacionMatricula" => $comprobacionMatricula,
    ]);
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
    if ((int) $velocidad_vehiculo > (int) $velocidad_max_operacion)
        $cod_alertagest .= "0001;"; // Alerta exceso de velocidad
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

$cod_alertagest = rtrim($cod_alertagest, ";");

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

$alertas = [];
if ($insert !== false && $cod_alertagest !== null && $cod_alertagest != "") {
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
}

// Guardar imagenes
$imagesDir = $_SERVER['DOCUMENT_ROOT'] . "/core/fotos";
if (!file_exists("{$imagesDir}/{$subDir}")) {
    mkdir(
        directory: "{$imagesDir}/{$subDir}",
        permissions: 0775, // rwxrwxr-- (Read - 4, Write - 2, Execute - 1)
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

if ($alertas && !empty($alertas)) {
    enviarAlertaSocket($alertas);
}

// CONSULTAR DGT:
//consultarDGT($matricula);

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
                'marca' => $marca ?? null,
                'color' => $color ?? null,
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

acabarRequest([
    "insert" => $insert,
]);
