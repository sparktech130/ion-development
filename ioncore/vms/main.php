<?php

use Funciones\Devices;
use Funciones\NxConnection;

require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/mail.php";

$getMkvUrl = function (
    NxConnection $nx,
    $deviceId,
    $pos,
    $endPos,
    $download = false,
) {
    $allUrls = Devices::getNxStreamingUrl(
        nx: $nx,
        deviceId: $deviceId,
        pos: $pos,
        endPos: $endPos,
        download: $download,
    );

    if (!$allUrls) {
        return null;
    }

    $mkv_url = $allUrls[0];
    return $mkv_url;
};

$getMkvUrls = function (
    NxConnection $nx,
    $deviceId,
    $pos,
    $endPos,
    $download = false,
) use ($getMkvUrl) {
    $mkv_url = $getMkvUrl(
        nx: $nx,
        deviceId: $deviceId,
        pos: $pos,
        endPos: $endPos,
        download: $download,
    );

    return [
        "default" => "$mkv_url",
        "low" => "$mkv_url&stream=1",
        "high" => "$mkv_url&stream=0"
    ];
};

function compartirVideoMail($datos_mail)
{
    $datos_usuario_inicial = obtenerUsuariosParam($datos_mail["usuario_inicial"]);
    $datos_usuario_inicial = $datos_usuario_inicial[0];

    $email = $datos_mail["email"] ?? null;
    if (!$email)
        return false;

    $subject = "Te han compartido un video '{$datos_mail["titulo"]}'";
    $htmlContent = obtenerMailCompartirVideo();
    $htmlContent = replaceEmailData($htmlContent, [
        "titulo" => $datos_mail["titulo"],
        "nom_dispositivo" => $datos_mail["nom_dispositivo"],
        "link_descarga" => $datos_mail["link_descarga"] ?? null,
        "usuario_inicial" => "{$datos_usuario_inicial->nombre} {$datos_usuario_inicial->apellidos}",
        "usuario_compartido" => explode("@", $email)[0],
    ]);

    enviarCorreo(
        subject: $subject,
        body: $htmlContent,
        address: $email,
        isHTML: true,
    );
    return true;
}

function insertarVideoCompartido(
    $titulo = null,
    $cod_dispositivo = null,
    $pos = null,
    $endPos = null,
    $usuario_inicial = null,
    $usuario_compartido = null,
    $mail_compartido = null,
    $fecha_hora_compartido = null,
    $fecha_hora_caducidad = null,
    $imagen = null,
    $velocidad = null,
    $cod_modulo = null,
    $enlace_video = null,
    $enviarSocketYMail = false,
    $route = "ionsmartV3",
) {
    $nombre_tabla = "{{.CORE}}.video_compartido";
    $datos_tabla = [
        "titulo" => $titulo,
        "cod_dispositivo" => $cod_dispositivo,
        "pos" => $pos,
        "endPos" => $endPos,
        "usuario_inicial" => $usuario_inicial,
        "usuario_compartido" => $usuario_compartido,
        "mail_compartido" => $mail_compartido,
        "fecha_hora_compartido" => $fecha_hora_compartido,
        "fecha_hora_caducidad" => $fecha_hora_caducidad,
        "imagen" => $imagen,
        "velocidad" => $velocidad,
        "cod_modulo" => $cod_modulo,
        "enlace_video" => $enlace_video
    ];

    $bd = obtenerConexion();
    $insert = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, true);

    if ($insert !== false && !isset($insert["error"]) && isset($usuario_compartido) && $enviarSocketYMail) {
        enviarVideoCompartido($insert, $titulo, $cod_dispositivo, $usuario_inicial, $usuario_compartido, $cod_modulo, $route);
    }

    return $insert;
}

function enviarVideoCompartido(
    $cod_video,
    $titulo,
    $cod_dispositivo,
    $usuario_inicial,
    $usuario_compartido,
    $cod_modulo,
    $route = "ionsmartV3",
) {
    $datos_dispositivo = obtenerDispositivos($cod_dispositivo);

    if (!(!empty($datos_dispositivo) && !isset($datos_dispositivo["error"])))
        return false;

    $datos_envio = [
        "cod_video" => $cod_video,
        "titulo" => $titulo,
        "cod_dispositivo" => $cod_dispositivo,
        "nom_dispositivo" => $datos_dispositivo[0]->nom_dispositivo,
        "usuario_inicial" => $usuario_inicial,
        "usuario_compartido" => $usuario_compartido,
        "cod_modulo" => $cod_modulo,
        "link_descarga" => "https://{$_ENV["ION_SERVER"]}/{$route}"
    ];

    enviarVideoCompartidoSocket($datos_envio);
    enviarMailVideoCompartido($datos_envio);
}

function insertarTimelinesVideo(
    $cod_dispositivo,
    $cod_video,
    $pos,
    $endPos,
) {
    $dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);
    $disp = $dispositivo[0];

    $systemId = $disp->systemId ?? null;
    $nx = new NxConnection(
        systemId: $systemId,
        ip: $disp->ip,
        puerto: $disp->puerto,
        user: $disp->user,
        password: $disp->password,
    );

    $footagesMotion = Devices::getThisFootage(
        nx: $nx,
        deviceId: $disp->deviceId,
        periodType: "motion",
        startTimeMs: $pos,
        endTimeMs: $endPos,
        assoc: false,
    );

    $footagesRecording = Devices::getThisFootage(
        nx: $nx,
        deviceId: $disp->deviceId,
        periodType: "recording",
        startTimeMs: $pos,
        endTimeMs: $endPos,
        assoc: false,
    );

    $formatFootages = function ($footages) {
        for ($i = 0; $i < count($footages); $i++) {
            $ftg = $footages[$i];
            $startTimeSeconds = $ftg->startTimeMs / 1000;

            $DateTimeInicio = new DateTime("@{$startTimeSeconds}");
            $DateTimeInicio->setTimezone(TIME_ZONE);
            $ftg->fecha_hora_inicio = $DateTimeInicio->format("Y-m-d H:i:s");

            if ($ftg->durationMs > 0) {
                $durationSeconds = round($ftg->durationMs / 1000, 0, PHP_ROUND_HALF_UP);
                $DateTimeFinal = $DateTimeInicio->modify("+{$durationSeconds} seconds");
                $ftg->fecha_hora_final = $DateTimeFinal->format("Y-m-d H:i:s");
            }

            unset($ftg->serverId);

            $footages[$i] = $ftg;
        }
        return json_encode($footages);
    };

    if (isset($footagesRecording) && is_array($footagesRecording)) {
        $footagesRecording = $formatFootages($footagesRecording);
        insertarTimelineVideo($cod_video, $footagesRecording);
    }

    if (isset($footagesMotion) && is_array($footagesMotion)) {
        $footagesMotion = $formatFootages($footagesMotion);
        insertarTimelineVideo($cod_video, $footagesMotion, true);
    }
}

function insertarTimelineVideo($cod_video, $datos, $movimiento = false)
{
    $nombre_tabla = "{{.CORE}}.video_compartido_timeline";
    $datos_tabla = [
        "cod_video" => $cod_video,
        "datos" => $datos,
        "movimiento" => $movimiento ? "1" : "0",
    ];

    $bd = obtenerConexion();
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla);
}

function enviarVideoCompartidoNode($cod_video, $mkvUrl, $videoSpeed, $expiry_days = 2)
{
    // LLamada node
    // Recepción respuesta
    // Estado finalizado? poner fecha caducidad y enlace en bbdd
    // Estado fallido? poner estado fallido en bbdd

    $server = NODE_GUARDAR_VIDEOS_URL;
    $postData = [
        "url" => $mkvUrl,
        "speed" => $videoSpeed ?? 1,
        "expiry_days" => $expiry_days ?? 2
    ];

    $respuestaVideo = llamadaCurl($server, $postData, ["Content-Type: application/json"], true);

    if (
        !isset($respuestaVideo["response"]) ||
        $respuestaVideo["response"]["success"] !== true
    ) {
        return null;
    } else {
        $respuestaVideo = $respuestaVideo["response"];

        $enlace_video = $respuestaVideo["downloadUrl"];
        $fecha_hora_caducidad = $respuestaVideo["expireDate"];

        if ($fecha_hora_caducidad && $fecha_hora_caducidad !== "") {
            $dt = new DateTimeImmutable($fecha_hora_caducidad); // entiende ISO8601 con Z
            $fecha_hora_caducidad = $dt->format("Y-m-d H:i:s");
        }
    }

    modificarVideoCompartido($cod_video, $enlace_video, $fecha_hora_caducidad ?? null);
    return $enlace_video;
}

function obtenerVideosRecibidos(
    $usuario_compartido = null,
    $cod_video = null,
    $cod_dispositivo = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $cod_usuario = null,
    $cod_modulo = null,
    $enlace_video = null,
    $limit = null,
    $noCaducado = false
) {
    $sql =
        "SELECT 
			v.cod_video, v.titulo, v.enlace_video, v.cod_dispositivo, d.nom_dispositivo, v.usuario_inicial, 
			v.pos, v.endPos, v.velocidad, v.fecha_hora_compartido, v.fecha_hora_caducidad, v.imagen,
			u.nombre, u.apellidos, v.cod_modulo
		FROM 
            {{.CORE}}.video_compartido v
		LEFT JOIN
			{{.CORE}}.usuarios u ON v.usuario_inicial = u.cod_usuario
		LEFT JOIN
			{{.CORE}}.dispositivos d ON v.cod_dispositivo = d.cod_dispositivo
		";

    $sql .= "WHERE 1 ";
    $values = [];

    if ($cod_dispositivo) {
        $sql .= "AND v.cod_dispositivo = ? ";
        $values[] = $cod_dispositivo;
    }

    if ($cod_video) {
        $sql .= "AND v.cod_video = ? ";
        $values[] = $cod_video;
    }

    if ($fecha_ini && $fecha_fin) {
        $sql .= "AND CAST(v.fecha_hora_compartido AS DATE) BETWEEN ? AND ? ";
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    }

    if ($cod_usuario) {
        $sql .= "AND v.usuario_inicial = ? ";
        $values[] = $cod_usuario;
    }

    if ($usuario_compartido) {
        $sql .= "AND v.usuario_compartido = ? ";
        $values[] = $usuario_compartido;
    }

    if ($cod_modulo) {
        $sql .= "AND v.cod_modulo = ? ";
        $values[] = $cod_modulo;
    }

    if ($enlace_video === true) {
        $sql .= "AND v.enlace_video IS NOT NULL ";
    } else {
        $sql .= "AND ((v.velocidad != 1 AND v.enlace_video IS NOT NULL) OR v.velocidad = 1) ";
    }

    if ($noCaducado === true) {
        $sql .= "AND NOW() < v.fecha_hora_caducidad ";
    }
    $sql .= "ORDER BY v.fecha_hora_compartido DESC ";

    if ($limit) {
        $sql .= "LIMIT ?;";
        $values[] = $limit;
    }

    try {
        $bd = obtenerConexion();
        $videos = ejecutarConsultaSQL($bd, $sql, $values, true);

        if (!isset($videos["error"]) && !empty($videos)) {
            foreach ($videos as $video) {
                $video->timeline_movimiento = obtenerTimelineVideo($video->cod_video, "1");
                $video->timeline_grabacion = obtenerTimelineVideo($video->cod_video, "0");
            }
        }
        return $videos;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerTimelineVideo($cod_video, $movimiento)
{
    $sql =
        "SELECT 
			datos
		FROM 
			{{.CORE}}.video_compartido_timeline v
		";

    $sql .= "WHERE 1 ";
    $values = [];

    if ($cod_video) {
        $sql .= "AND v.cod_video = ? ";
        $values[] = $cod_video;
    }

    if ($movimiento) {
        $sql .= "AND v.movimiento = ? ";
        $values[] = $movimiento;
    }

    try {
        $bd = obtenerConexion();
        $timelines = ejecutarConsultaSQL($bd, $sql, $values, true);
        if (empty($timelines) || isset($timelines["error"]) && isset($timelines[0]->datos)) {
            return [];
        } else {
            $footages = json_decode($timelines[0]->datos);
            return $footages;
        }
        return $timelines;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerVideosRecibidosCount(
    $usuario_compartido,
    $cod_modulo = null,
    $enlace_video = null
) {
    $sql =
        "SELECT 
			COUNT(v.cod_video) as total
		FROM 
			{{.CORE}}.video_compartido v
		";

    $sql .= "WHERE 1 ";
    $values = [];

    if ($usuario_compartido) {
        $sql .= "AND v.usuario_compartido = ? ";
        $values[] = $usuario_compartido;
    }

    if ($cod_modulo) {
        $sql .= "AND v.cod_modulo = ? ";
        $values[] = $cod_modulo;
    }

    if ($enlace_video === true) {
        $sql .= "AND v.enlace_video IS NOT NULL ";
    } else if ($enlace_video === false) {
        $sql .= "AND ((v.velocidad != 1 AND v.enlace_video IS NOT NULL) OR v.velocidad = 1) ";
    }
    $sql .= "ORDER BY v.fecha_hora_compartido DESC";

    try {
        $bd = obtenerConexion();
        $videos = ejecutarConsultaSQL($bd, $sql, $values, true);
        if (empty($videos) || isset($videos["error"])) {
            return 0;
        } else {
            return $videos[0]->total;
        }
        return $videos;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function modificarVideoCompartido(
    $cod_video,
    $enlace_video = null,
    $fecha_hora_caducidad = null
) {
    if (!$cod_video || (!$enlace_video && !$fecha_hora_caducidad))
        return false;

    $nombre_tabla = "{{.CORE}}.video_compartido";
    $datos_tabla = [
        "enlace_video" => $enlace_video,
        "fecha_hora_caducidad" => $fecha_hora_caducidad,
    ];
    $datos_condicionales = [
        "cod_video" => $cod_video,
    ];

    $bd = obtenerConexion();
    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

function eliminarVideo($cod_video)
{
    if (!$cod_video)
        return false;

    $nombre_tabla = "{{.CORE}}.video_compartido";
    $datos_condicionales = ["cod_video" => $cod_video];

    $bd = obtenerConexion();
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function convertirCoordenadasFiltro($coordenadas)
{
    if (is_object($coordenadas)) {
        $x1 = $coordenadas->x1 ?? null;
        $y1 = $coordenadas->y1 ?? null;
        $x2 = $coordenadas->x2 ?? null;
        $y2 = $coordenadas->y2 ?? null;
    } else {
        $x1 = $coordenadas['x1'] ?? null;
        $y1 = $coordenadas['y1'] ?? null;
        $x2 = $coordenadas['x2'] ?? null;
        $y2 = $coordenadas['y2'] ?? null;
    }

    // Dimensiones del frame
    $frameWidth = 43;
    $frameHeight = 31;

    // Convertir las coordenadas
    $x = $x1 * $frameWidth;
    $y = $y1 * $frameHeight;
    $width = ($x2 - $x1) * $frameWidth;
    $height = ($y2 - $y1) * $frameHeight;

    return ['x' => $x, 'y' => $y, 'width' => $width, 'height' => $height];
}
