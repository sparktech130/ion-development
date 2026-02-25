<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/consts.php';
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/utils/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/utils/imagen.php";
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/dispositivos/main.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/reconocimientos/main.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/utils/notificaciones.php';
include_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/alertas/main.php"; // opcional
include_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/listas/main.php"; // para destinatarios

error_reporting(E_ALL & ~E_DEPRECATED);

$start = time();

$fmodif = date("Y-m-d_H-i-s", $start);
$year_month = date("Y-m", $start);
$day = date("d", $start);
$moment = date("His", $start);

$listas_db = obtenerListasParam();
if (!$listas_db || isset($listas_db["error"])) {
    acabarRequest($listas_db);
}

$listas_db_codes = array_map(
    array: $listas_db,
    callback: function ($l) {
        return (int)$l->cod_lista;
    },
);

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj, true);
$returnObj = [];
$reconocimientosCorrectos = [];

$cod_usuario = $_SESSION["cod_usuario_token"] ?? null;
$cod_dispositivo = $jsonobj2["cod_dispositivo"] ?? null;
if (!($cod_usuario && $cod_dispositivo)) {
    acabarRequest([
        "message" => "Bad request: cod_dispositivo o cod_usuario inválido",
        "campos" => [
            "cod_dispositivo" => $cod_dispositivo,
            "cod_usuario" => $cod_usuario,
        ],
        "error" => true,
    ], 400, true);
}

$dispositivo = obtenerDispositivos(cod_dispositivo: $cod_dispositivo);
if (empty($dispositivo) || isset($dispositivo["error"])) {
    acabarRequest([
        "message" => "Dispositivo no encontrado",
        "error" => true,
    ], 400, true);
}

$dispositivo = $dispositivo[0];
$cod_dispositivo = $dispositivo->cod_dispositivo;
$nom_dispositivo = $dispositivo->nom_dispositivo;

if (!dispositivoTieneModulos($cod_dispositivo)) {
    EscribirLog(
        "Dispositivo {$cod_dispositivo} ({$nom_dispositivo}) - El dispositivo no tiene los módulos necesarios",
    );
    acabarRequest([
        "message" => "El dispositivo no tiene los módulos necesarios",
        "error" => true,
    ]);
}

$validarRecon = function (array $recon): stdClass {
    $data = (object)[
        "valid" => false,
        "message" => "",
    ];
    if (!($recon["matricula"] && $recon["matricula"] != "")) {
        $data->message = "matricula inválida: '{$recon["matricula"]}'";
        return $data;
    }

    if (!(
        $recon["fecha_hora"] &&
        $recon["fecha_hora"] != "" &&
        !verifyDate($recon["fecha_hora"])
    )) {
        $data->message = "fecha_hora inválida: '{$recon["fecha_hora"]}'";
        return $data;
    }

    if (!(
        $recon["lat"] &&
        $recon["lat"] != "" &&
        $recon["lon"] &&
        $recon["lon"] != ""
    )) {
        $data->message = "coordenadas inválidas: '{$recon["lat"]},{$recon["lon"]}'";
        return $data;
    }

    if (!(
        $recon["imagen"] &&
        $recon["imagen"] != "" &&
        base64_decode($recon["imagen"]) !== false
    )) {
        $data->message = "imagen no recibida o inválida";
        return $data;
    }

    if ($recon["coordenadas_matricula"] && !(
        $recon["coordenadas_matricula"]["x"] &&
        $recon["coordenadas_matricula"]["y"] &&
        $recon["coordenadas_matricula"]["width"] &&
        $recon["coordenadas_matricula"]["height"]
    )) {
        $data->message = "coordenadas_matricula inválidas, formato esperado: '{x, y, width, height}";
        return $data;
    }

    $data->valid = true;
    return $data;
};

$reconocimientos = $jsonobj2["reconocimientos"] ?? [];
if (!is_array($reconocimientos) && !is_object($reconocimientos)) {
    acabarRequest([
        "message" => "Bad request: reconocimientos inválidos",
        "error" => true,
    ], 400, true);
}

$acciones_listas_permitidas = ["insert", "delete"];

$validarRecon = function (array $recon) use ($acciones_listas_permitidas): stdClass {
    $data = (object)[
        "valid" => false,
        "message" => "",
    ];
    if (!($recon["matricula"] && $recon["matricula"] != "")) {
        $data->message = "matricula inválida: '{$recon["matricula"]}'";
        return $data;
    }

    if (!(
        $recon["fecha_hora"] &&
        $recon["fecha_hora"] != "" &&
        verifyDate($recon["fecha_hora"])
    )) {
        $data->message = "fecha_hora inválida: '{$recon["fecha_hora"]}'";
        return $data;
    }

    if (!(
        $recon["lat"] &&
        $recon["lat"] != "" &&
        $recon["lon"] &&
        $recon["lon"] != ""
    )) {
        $data->message = "coordenadas inválidas: '{$recon["lat"]},{$recon["lon"]}'";
        return $data;
    }

    if (!(
        $recon["imagen"] &&
        $recon["imagen"] != "" &&
        base64_decode($recon["imagen"]) !== false
    )) {
        $data->message = "imagen no recibida o inválida";
        return $data;
    }

    if ($recon["coordenadas_matricula"] && !(
        $recon["coordenadas_matricula"]["x"] &&
        $recon["coordenadas_matricula"]["y"] &&
        $recon["coordenadas_matricula"]["width"] &&
        $recon["coordenadas_matricula"]["height"]
    )) {
        $data->message = "coordenadas_matricula inválidas, formato esperado: '{x, y, width, height}";
        return $data;
    }

    if (isset($recon["listas"])) {
        $invalid = false;
        foreach ($recon["listas"] as $l) {
            if (!(
                isset($l["cod_lista"]) &&
                isset($l["accion"]) &&
                in_array($l["accion"], $acciones_listas_permitidas)
            )) {
                $invalid = true;
                break;
            }
        }

        if ($invalid) {
            $data->message = "listas inválidas";
            return $data;
        }
    }

    $data->valid = true;
    return $data;
};

$procesarListasMatricula = function (string $matricula, array|null $listas, string|null $observaciones) use ($listas_db_codes): bool|RuntimeException {
    if (!(
        $matricula &&
        $listas &&
        !empty($listas)
    )) {
        return false;
    }

    $insert = [];
    $delete = [];

    foreach ($listas as $l) {
        if (!in_array(
            (int)$l["cod_lista"],
            $listas_db_codes,
        )) {
            throw new RuntimeException("Lista no encontrada o inválida.");
        }

        switch ($l["accion"]) {
            case "insert":
                $insert[] = $l["cod_lista"];
                break;

            case "delete":
                $delete[] = $l["cod_lista"];
                break;
        };
    }

    // Insertar matrícula en listas indicadas
    foreach ($insert as $l) {
        $order = insertarVehiculosListas(
            cod_lista: $l["cod_lista"],
            matricula: $matricula,
            descripcion_vehiculo: $observaciones,
        );

        if (!($order && !isset($order["error"]))) {
            throw new RuntimeException("Error al insertar en lista {$l["cod_lista"]}: {$order["message"]}");
        }
    }

    // Eliminar matrícula de listas indicadas
    foreach ($delete as $l) {
        $order = eliminarVehiculosListasMatricula(
            cod_lista: $l["cod_lista"],
            matricula: $matricula,
        );

        if (!($order && !isset($order["error"]))) {
            throw new RuntimeException("Error al eliminar de lista {$l["cod_lista"]}: {$order["message"]}");
        }
    }

    return true;
};

$procesarReconocimiento = function (array $recon) use (
    $cod_usuario,
    $dispositivo,
    $procesarListasMatricula,
    $year_month,
    $day,
    $moment,
    $fmodif,
) {
    // Variables obligatorias:
    $matricula = $recon["matricula"];
    $fecha_hora = $recon["fecha_hora"];
    $lat = $recon["lat"];
    $lon = $recon["lon"];
    $imagen = $recon["imagen"];

    [$fecha, $hora] = explode(" ", $fecha_hora);

    // Variables opcionales:
    $coordenadas_matricula = $recon["coordenadas_matricula"] ?? null;
    $observaciones = $recon["observaciones"] ?? null;
    $marca = $recon["marca"] ?? " ";
    $modelo = $recon["modelo"] ?? " ";
    $color = $recon["color"] ?? "";
    $tipo_vh = $recon["tipo_vh"] ?? "";
    $pais = $recon["pais"] ?? " ";
    $velocidad_vehiculo = $recon["velocidad_vehiculo"] ?? "";
    $orientacion = $recon["orientacion"] ?? "";

    $listas = $recon["listas"] ?? null;

    $matr_correcta = comprobarMatricula($matricula);
    if ($matr_correcta == false) {
        EscribirLog(
            "Matrícula incorrecta: ({$matricula})",
            "error"
        );
        return ["message" => "La matrícula es incorrecta ({$matricula})"];
    }

    try {
        $procesarListasMatricula($matricula, $listas, $observaciones);
    } catch (RuntimeException $e) {
        return ["message" => "Error al procesar listas: {$e->getMessage()}", "error" => true];
    }

    $imagenp = obtenerImagenMatricula($coordenadas_matricula, $imagen);

    $subDir = "{$year_month}/{$day}";

    if (isset($imagen)) {
        $imagen = trim($imagen);
        $nombre_foto = sprintf("%s/%s_%s.jpg", $subDir, $moment, $matricula);
    }

    if (isset($imagenp)) {
        $imagenp = trim($imagenp);
        $nombre_fotop = sprintf("%s/%s_%sp.jpg", $subDir, $moment, $matricula);
    }
    $estado = "";
    $distintivo = "";
    $cod_alertagest = "";
    $confidence = "";
    $incidencia = "";

    $cod_provincia = '03';
    $cod_poblacion = '000004';

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

    if (function_exists("obtenerAlertasAreaMatriculaCoordenadas")) {
        $alertas = obtenerAlertasAreaMatriculaCoordenadas(
            matricula: $matricula,
            lat: $lat,
            lon: $lon,
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
        cod_dispositivo: $dispositivo->cod_dispositivo,
        fecha_modif: $fmodif,
        marca: $marca,
        modelo: $modelo,
        color: $color,
        tipo_vh: $tipo_vh,
        estado: $estado,
        distintivo: $distintivo,
        velocidad_vehiculo: $velocidad_vehiculo,
        latitud: $lat,
        longitud: $lon,
        orientacion: $orientacion,
        observaciones: $observaciones,
        cod_usuario: $cod_usuario,
        cod_alertagest: $cod_alertagest,
        llamarNode: true
    );

    if (!($insert && !isset($insert["error"]))) {
        return $insert;
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
                cod_dispositivo: $dispositivo->cod_dispositivo,
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
    if (isset($imagen) && isset($nombre_foto)) {
        $Base64Img = $imagen;
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

    if (isset($imagenp) && isset($nombre_fotop)) {
        $Base64Imgp = $imagenp;

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

    return [
        "message" => "Reconocimiento insertado correctamente",
        "cod_reconoc" => $insert,
        "datos" => [
            "nombre_foto" => $nombre_foto,
            "nombre_fotop" => $nombre_fotop,
            "fecha" => $fecha,
            "hora" => $hora,
            "cod_dispositivo" => $dispositivo->cod_dispositivo,
            "nom_dispositivo" => $dispositivo->nom_dispositivo,
        ],
        "error" => false,
    ];
};

$returnObj = ["reconocimientos" => [], "request_seconds" => 0];
foreach ($reconocimientos as $key => $recon) {
    $validation = $validarRecon($recon);
    if (!$validation->valid) {
        $returnObj["reconocimientos"][$key] = $validation;
        continue;
    }

    $insert = $procesarReconocimiento($recon);
    $returnObj["reconocimientos"][$key] = $insert;

    if ($insert === true || $insert["error"] === false) {
        $recon["datos"] = $insert["datos"];

        $reconocimientosCorrectos[$key] = $recon;
    }
}
$endTime = time();
$returnObj["request_seconds"] = $endTime - $start;
acabarRequestSinSalir(
    $returnObj,
);

// CONSULTAR DGT:
//consultarDGT($matricula);

// Notificar a destinatarios de listas si la matrícula está en alguna lista
if (function_exists("obtenerDestinatariosPorMatricula")) {
    foreach ($reconocimientosCorrectos as $key => $r) {
        try {
            $destinatarios = obtenerDestinatariosPorMatricula($r["matricula"]);

            if (!empty($destinatarios) && is_array($destinatarios) && !isset($destinatarios['error'])) {
                EscribirLog(
                    "Se encontraron " . count($destinatarios) . " destinatarios para la matrícula {$r["matricula"]}"
                );

                $datosReconocimiento = [
                    'matricula' => $r["matricula"],
                    'nom_dispositivo' => $r["datos"]["nom_dispositivo"],
                    'cod_dispositivo' => $r["datos"]["cod_dispositivo"],
                    'fecha' => $r["datos"]["fecha"],
                    'hora' => $r["datos"]["hora"],
                    'foto' => $r["datos"]["nombre_foto"] ?? null,
                    'fotop' => $r["datos"]["nombre_fotop"] ?? null,
                    'pais' => $r["pais"] ?? null,
                    'velocidad' => $r["velocidad_vehiculo"] ?? null,
                    'marca' => $r["marca"] ?? null,
                    'color' => $r["color"] ?? null,
                ];

                $resultadosNotificaciones = enviarNotificacionLista($datosReconocimiento, $destinatarios);

                EscribirLog(
                    "Notificaciones procesadas para matrícula {$r["matricula"]}: " .
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
}

function obtenerImagenMatricula($coordenadas_matricula, $imagen): string|null
{
    if (
        $coordenadas_matricula == null ||
        $imagen == null ||
        empty($coordenadas_matricula) ||
        $imagen == ""
    ) {
        return null;
    }

    // Recortar imagen respecto a las matrículas
    return @cropBase64Image(
        base64: $imagen,
        x: $coordenadas_matricula["x"],
        y: $coordenadas_matricula["y"],
        w: $coordenadas_matricula["width"],
        h: $coordenadas_matricula["height"],
        outMime: "image/jpg",
        quality: 20,
    );
};
