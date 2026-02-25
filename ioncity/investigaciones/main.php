<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/main.php";

if (!defined("LOGS_ACCION_INVESTIGACIONES"))
    define("LOGS_ACCION_INVESTIGACIONES", [
        "insertarInvestigacion" => "INS-INV",
        "modificarInvestigacion" => "UPD-INV",
        "eliminarInvestigacion" => "DEL-INV",
        "insertarDispositivosInvestigacion" => "INS-DISP-INV",
        "eliminarDispositivosInvestigacion" => "DEL-DISP-INV",
    ]);

// =========================
// ==== INVESTIGACIONES ====
// =========================
function obtenerInvestigacionesParam(
    $cod_investigacion = null,
    $nombre_investigacion = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $hora_ini = null,
    $hora_fin = null,
    $tipo_analisis = null,
    $cod_usuario = null,
    $estado = null
) {
    $sql =
        "SELECT 
                inv.*, 
                CASE 
                    WHEN inv.fecha_hora_fin IS NULL THEN 'En curso'
                    ELSE 'Finalizada'
                END as estado,
                u.nombre_usuario, u.email, u.nombre, u.apellidos
            FROM 
                {{.CITY}}.investigacion inv
            LEFT JOIN
                {{.CORE}}.usuarios u ON inv.cod_usuario = u.cod_usuario
            WHERE 1 ";
    $values = [];

    if ($cod_investigacion) {
        $sql .= "AND inv.cod_investigacion = ? ";
        $values[] = $cod_investigacion;
    }

    if ($nombre_investigacion) {
        $sql .= "AND inv.nombre_investigacion LIKE ? ";
        $values[] = "%$nombre_investigacion%";
    }

    if ($fecha_ini && $fecha_fin) {
        $sql .= "AND (CAST(inv.fecha_hora_ini AS DATE) BETWEEN ? AND ? OR CAST(inv.fecha_hora_fin AS DATE) BETWEEN ? AND ?) ";
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    }

    if ($hora_ini && $hora_fin) {
        $sql .= "AND (CAST(inv.fecha_hora_ini AS TIME) BETWEEN ? AND ? OR CAST(inv.fecha_hora_fin AS TIME) BETWEEN ? AND ?) ";
        $values[] = $hora_ini;
        $values[] = $hora_fin;
        $values[] = $hora_ini;
        $values[] = $hora_fin;
    }

    if ($tipo_analisis) {
        if (is_array($tipo_analisis) && !empty($tipo_analisis)) {
            $val = "AND (";
            foreach ($tipo_analisis as $tipo) {
                $val .= "inv.tipo_analisis LIKE ? OR ";
                $values[] = "%{$tipo}%";
            }
            $val = rtrim($val, "OR ") . ") ";
            $sql .= $val;
        } else if (is_string($tipo_analisis)) {
            $sql .= "AND inv.tipo_analisis LIKE ? ";
            $values[] = "%$tipo_analisis%";
        }
    }

    if ($cod_usuario) {
        $sql .= "AND inv.cod_usuario = ? ";
        $values[] = $cod_usuario;
    }

    if ($estado && is_string($estado)) {
        $estado = strtolower($estado);

        $sql .= match ($estado) {
            "en curso" => "AND inv.fecha_hora_fin IS NULL ",
            "finalizada" => "AND inv.fecha_hora_fin IS NOT NULL ",
            default => ""
        };
    }

    try {
        $bd = obtenerConexion();
        $investigaciones = ejecutarConsultaSQL($bd, $sql, $values, true);
        foreach ($investigaciones as $inv) {
            $inv->dispositivos = obtenerDispositivosInvestigacion($inv->cod_investigacion);
        }
        return $investigaciones;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerInvestigacionesCount()
{
    $sql = "SELECT COUNT(inv.cod_investigacion) as total FROM {{.CITY}}.investigacion inv ";
    $values = [];

    try {
        $bd = obtenerConexion();
        $invs = ejecutarConsultaSQL($bd, $sql, $values, true);
        if (empty($invs) || isset($invs["error"])) {
            return 0;
        } else {
            return $invs[0]->total;
        }
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function formatarTipoAnalisisInvestigacion($tipos)
{
    $tipos_return = [];

    if (is_array($tipos) && !empty($tipos)) {
        foreach ($tipos as $tipo) {
            $tipo = strtolower($tipo);
            if ($tipo !== "vehiculos" && $tipo !== "facial") continue;

            if (array_search($tipo, $tipos_return) === false) {
                $tipos_return[] = $tipo;
            }
        }
    }

    return !empty($tipos_return) ? implode(";", $tipos_return) : false;
}

function insertarInvestigacion(
    $nombre_investigacion,
    $descripcion,
    $fecha_hora_ini,
    $coordenadas,
    $direccion,
    $cod_usuario
) {
    // $tipo_analisis = formatarTipoAnalisisInvestigacion($tipo_analisis);
    // if ($tipo_analisis === false) return false;

    $nombre_tabla = "{{.CITY}}.investigacion";
    $campos = [
        "nombre_investigacion" => $nombre_investigacion,
        "descripcion" => $descripcion,
        "fecha_hora_ini" => $fecha_hora_ini,
        "coordenadas" => $coordenadas,
        "direccion" => $direccion,
        "cod_usuario" => $cod_usuario
    ];

    $bd = obtenerConexion();
    $cod_investigacion = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos, true);

    if ($cod_investigacion) {
        insertarLogInvestigacion(
            $cod_investigacion,
            $_SESSION["cod_sesion_usuario"] ?? null,
            "Abrir investigación: {$cod_investigacion} - {$nombre_investigacion}",
            LOGS_ACCION_INVESTIGACIONES[__FUNCTION__]
        );
    }
    return $cod_investigacion;
}

function modificarInvestigacion(
    $cod_investigacion,
    $nombre_investigacion = null,
    $descripcion = null,
    $fecha_hora_fin = null,
    $coordenadas = null,
    $direccion = null,
) {
    if (!$cod_investigacion) return false;

    $datos_investigacion = obtenerInvestigacionesParam($cod_investigacion);
    if (!(!empty($datos_investigacion) && !isset($datos_investigacion["error"]))) return false;

    $nombre_tabla = "{{.CITY}}.investigacion";
    $campos = [
        "nombre_investigacion" => $nombre_investigacion,
        "descripcion" => $descripcion,
        "fecha_hora_fin" => $fecha_hora_fin,
        "coordenadas" => $coordenadas,
        "direccion" => $direccion,
    ];
    $datos_condicionales = ["cod_investigacion" => $cod_investigacion];

    $nombre_investigacion = $nombre_investigacion ?? $datos_investigacion[0]->nombre_investigacion;

    $bd = obtenerConexion();
    $update = modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos, $datos_condicionales,);

    $cod_investigacion_log = +$cod_investigacion;
    if ($update) {
        $extra_data = match ($fecha_hora_fin) {
            "VACIAR" => "Reabrir investigación",
            null => "Investigación modificada",
            default => "Cerrar investigación",
        };

        insertarLogInvestigacion(
            $cod_investigacion,
            $_SESSION["cod_sesion_usuario"] ?? null,
            "{$extra_data}: {$cod_investigacion_log} - {$nombre_investigacion}",
            LOGS_ACCION_INVESTIGACIONES[__FUNCTION__]
        );
    }

    return $update;
}

function eliminarInvestigacion(
    $cod_investigacion,
) {
    if (!$cod_investigacion) return false;

    $datos_investigacion = obtenerInvestigacionesParam($cod_investigacion);
    if (!(!empty($datos_investigacion) && !isset($datos_investigacion["error"]))) return false;

    $nombre_investigacion = $datos_investigacion[0]->nombre_investigacion;

    $nombre_tabla = "{{.CITY}}.investigacion";
    $datos_condicionales = ["cod_investigacion" => $cod_investigacion];
    $bd = obtenerConexion();
    $delete = eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);

    $cod_investigacion_log = +$cod_investigacion;
    if ($delete) {
        insertarLogInvestigacion(
            $cod_investigacion,
            $_SESSION["cod_sesion_usuario"] ?? null,
            "Investigación eliminada: {$cod_investigacion_log} - {$nombre_investigacion}",
            LOGS_ACCION_INVESTIGACIONES[__FUNCTION__]
        );
    }

    return $delete;
}

// ==== DISPOSITIVOS ====
function obtenerDispositivosInvestigacion(
    $cod_investigacion = null,
) {
    $sql =
        "SELECT 
                inv_disp.cod_dispositivo, d.nom_dispositivo, d.coordenadas,
                inv_disp.fecha_hora_ini, inv_disp.fecha_hora_fin
            FROM 
                {{.CITY}}.investigacion inv
            LEFT JOIN
                {{.CITY}}.investigacion_dispositivo inv_disp ON inv.cod_investigacion = inv_disp.cod_investigacion
            LEFT JOIN
                {{.CORE}}.dispositivos d ON inv_disp.cod_dispositivo = d.cod_dispositivo
            LEFT JOIN 
                {{.CORE}}.dispositivos_modulos dm ON dm.cod_dispositivo = d.cod_dispositivo
            WHERE inv.cod_investigacion = ?
            AND dm.cod_modulo = ?
            AND dm.estado_canal != ? 
            ";
    $values = [
        $cod_investigacion,
        MODULOS["analytic"]["cod_modulo"],
        ESTADOS_CANALES["ESTADO_CADUCADO"]
    ];

    try {
        $bd = obtenerConexion();
        $dispositivos = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $dispositivos;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function insertarDispositivosInvestigacion(
    $cod_investigacion = null,
    $dispositivos = null,
    $fecha_hora_ini = null,
    $fecha_hora_fin = null,
) {
    if (!($cod_investigacion && is_array($dispositivos) && !empty($dispositivos))) return false;

    $datos_investigacion = obtenerInvestigacionesParam($cod_investigacion);
    if (!(!empty($datos_investigacion) && !isset($datos_investigacion["error"]))) return false;

    $nombre_investigacion = $datos_investigacion[0]->nombre_investigacion;

    $buscarDispositivoArray = function ($arrayDispositivos, $cod_dispositivo) {
        return array_filter($arrayDispositivos, function ($disp) use ($cod_dispositivo) {
            return $disp->cod_dispositivo == $cod_dispositivo;
        });
    };

    $dispositivosBD = obtenerDispositivosModulo(MODULOS["analytic"]["cod_modulo"]);
    foreach ($dispositivos as $key => $cod_dispositivo) {
        $insertar = false;
        $cod_dispositivo = sprintf("%06d", $cod_dispositivo);
        // Comprobar si existe el dispositivo y tiene el módulo activo
        $existeDispositivo = !empty($buscarDispositivoArray($dispositivosBD, $cod_dispositivo));

        if ($existeDispositivo) {
            // Comprobamos que no se repita el dispositivo en la investigación
            $dispositivosInvestigacion = $datos_investigacion[0]->dispositivos;
            $insertar = empty($buscarDispositivoArray($dispositivosInvestigacion, $cod_dispositivo));
        }

        if (!$insertar) {
            unset($dispositivos[$key]);
            continue;
        }
    }
    $dispositivos = array_values($dispositivos);

    $nombre_tabla = "{{.CITY}}.investigacion_dispositivo";
    $bd = obtenerConexion();
    foreach ($dispositivos as $disp) {
        $campos = [
            "cod_investigacion" => $cod_investigacion,
            "cod_dispositivo" => $disp,
            "fecha_hora_ini" => $fecha_hora_ini,
            "fecha_hora_fin" => $fecha_hora_fin
        ];
        insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos, true);
    }

    if (!empty($dispositivos)) {
        $cod_investigacion_log = +$cod_investigacion;

        insertarLogInvestigacion(
            $cod_investigacion,
            $_SESSION["cod_sesion_usuario"] ?? null,
            count($dispositivos) . " dispositivos locales añadidos a la investigación: {$cod_investigacion_log} - {$nombre_investigacion}",
            LOGS_ACCION_INVESTIGACIONES[__FUNCTION__]
        );
    }

    // Retorna los códigos que se han insertado
    return ["dispositivos" => $dispositivos];
}

function eliminarDispositivosInvestigacion(
    $cod_investigacion = null,
    $dispositivos = null,
) {
    if (!($cod_investigacion && is_array($dispositivos) && !empty($dispositivos))) return false;

    $datos_investigacion = obtenerInvestigacionesParam($cod_investigacion);
    if (!(!empty($datos_investigacion) && !isset($datos_investigacion["error"]))) return false;

    $nombre_investigacion = $datos_investigacion[0]->nombre_investigacion;

    $nombre_tabla = "{{.CITY}}.investigacion_dispositivo";
    $datos_condicionales = [
        "cod_investigacion" => $cod_investigacion,
        "cod_dispositivo" => $dispositivos
    ];

    $cod_investigacion_log = +$cod_investigacion;

    insertarLogInvestigacion(
        $cod_investigacion,
        $_SESSION["cod_sesion_usuario"] ?? null,
        count($dispositivos) . " dispositivos locales eliminados de la investigación: {$cod_investigacion_log} - {$nombre_investigacion}",
        LOGS_ACCION_INVESTIGACIONES[__FUNCTION__]
    );

    $bd = obtenerConexion();
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

// ==============
// ==== LOGS ====
// ==============
function obtenerLogsInvestigacionParam(
    $cod_investigacion = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $hora_ini = null,
    $hora_fin = null,
    $cod_usuario = null,
    $cod_accion = null,
    $desc_accion = null,
    $order = null,
    $limit = null
) {
    $sql =
        "SELECT 
                inv_log.cod_sesion, inv_log.cod_investigacion, inv_log.cod_accion, log_acc.desc_accion, 
                inv_log.extra_data, inv_log.fecha, inv_log.hora, 
                u.cod_usuario, u.nombre_usuario
            FROM 
                {{.CITY}}.investigacion_log inv_log
            LEFT JOIN
                {{.CORE}}.mto_usuarios_log_acciones log_acc ON log_acc.accion = inv_log.cod_accion
            LEFT JOIN
                {{.CITY}}.investigacion inv ON inv.cod_investigacion = inv_log.cod_investigacion
            LEFT JOIN
                {{.CORE}}.mto_usuarios_sesiones usr_ses ON usr_ses.cod_sesion = inv_log.cod_sesion
            LEFT JOIN
                {{.CORE}}.usuarios u ON usr_ses.cod_usuario = u.cod_usuario
            WHERE 1 ";
    $values = [];

    if ($cod_investigacion) {
        $sql .= "AND inv_log.cod_investigacion = ? ";
        $values[] = $cod_investigacion;
    }

    if ($fecha_ini && $fecha_fin) {
        $sql .= "AND inv_log.fecha BETWEEN ? AND ? ";
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    }

    if ($hora_ini && $hora_fin) {
        $sql .= "AND inv_log.hora BETWEEN ? AND ? ";
        $values[] = $hora_ini;
        $values[] = $hora_fin;
    }

    if ($cod_usuario) {
        $sql .= "AND usr_ses.cod_usuario = ? ";
        $values[] = $cod_usuario;
    }

    if ($cod_accion) {
        $sql .= "AND log_acc.accion LIKE ? ";
        $values[] = "$cod_accion";
    }

    if ($desc_accion) {
        $sql .= "AND log_acc.desc_accion LIKE ? ";
        $values[] = "%$desc_accion%";
    }

    if ($order === "DESC" || $order === "ASC")
        $sql .= " ORDER BY inv_log.fecha $order, inv_log.hora $order ";

    if ($limit) {
        $sql .= "LIMIT ? ";
        $values[] = $limit;
    }

    try {
        $bd = obtenerConexion();
        $logs = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $logs;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerLogsInvestigacionCount($cod_investigacion = null)
{
    $sql = "SELECT COUNT(inv_log.cod_log) as total FROM {{.CITY}}.investigacion_log inv_log 
    WHERE 1 ";
    $values = [];

    if ($cod_investigacion) {
        $sql .= "AND inv_log.cod_investigacion = ? ";
        $values[] = $cod_investigacion;
    }

    try {
        $bd = obtenerConexion();
        $logs = ejecutarConsultaSQL($bd, $sql, $values, true);
        if (empty($logs) || isset($logs["error"])) {
            return 0;
        } else {
            return $logs[0]->total;
        }
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function insertarLogInvestigacion(
    $cod_investigacion,
    $cod_sesion,
    $extra_data,
    $cod_accion,
) {
    if (!($cod_investigacion && $cod_sesion && $cod_accion)) { return false; }

    $fecha_hora = new DateTime();
    $fecha_hora = explode(" ", $fecha_hora->format("Y-m-d H:i:s"));

    $nombre_tabla = "{{.CITY}}.investigacion_log";
    $campos = [
        "cod_investigacion" => $cod_investigacion,
        "cod_sesion" => $cod_sesion,
        "extra_data" => $extra_data,
        "cod_accion" => $cod_accion,
        "fecha" => $fecha_hora[0],
        "hora" => $fecha_hora[1],
    ];

    $bd = obtenerConexion();
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos, true);
}

function eliminarLogsInvestigacion($cod_investigacion)
{
    if (!$cod_investigacion) return false;

    $nombre_tabla = "{{.CITY}}.investigacion_log";
    $datos_condicionales = ["cod_investigacion" => $cod_investigacion];

    $bd = obtenerConexion();
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

// ==================
// ==== ARCHIVOS ====
// ==================
function insertarVideoInvestigacion(
    $cod_investigacion,
    $url_video
) {
    $nombre_tabla = "{{.CITY}}.investigaciones_videos";
    $campos = [
        "cod_investigacion" => $cod_investigacion,
        "url_video" => $url_video
    ];

    $bd = obtenerConexion();
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos, true);
}

function insertarRegistroInvestigacion(
    $cod_investigacion,
) {
    $nombre_tabla = "{{.CITY}}.investigaciones_registros";
    $campos = [
        "cod_investigacion" => $cod_investigacion,
    ];

    $bd = obtenerConexion();
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos, true);
}

