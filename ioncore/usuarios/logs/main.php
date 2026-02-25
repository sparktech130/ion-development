<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/mail.php";

function generarCodigoRandom() {
    $codigo = "";
    for ($i = 0; $i < 6; $i++) {
        if ($i % 2 == 0 && $i != 0) {
            $codigo .= "-";
        }
        $codigo .= rand(0, 9);
    }
    return $codigo;
}


function obtenerCodSesion($cod_usuario) {
	$bd = obtenerConexion();

	$datetime_entrada = obtenerUltimaEntrada($cod_usuario);
	if ($datetime_entrada != null)
		$datetime_entrada = $datetime_entrada[0]->entrada;

	$sql = "SELECT cod_sesion FROM {{.CORE}}.mto_usuarios_sesiones WHERE cod_usuario = ? AND entrada = ?;";
    $values = [$cod_usuario, $datetime_entrada];

    $result = ejecutarConsultaSQL($bd, $sql, $values, true);

	if (isset($result[0]->cod_sesion)) {
		return $result[0]->cod_sesion;
	}
    return null;
}

function obtenerUltimaEntrada($cod_usuario) {
    $bd = obtenerConexion();
    $sql = "SELECT entrada 
    FROM {{.CORE}}.mto_usuarios_sesiones 
    WHERE cod_usuario = ? 
    ORDER BY entrada DESC LIMIT 1;";

    return ejecutarConsultaSQL($bd, $sql, [$cod_usuario], true);
}

function crearSesionUsuario(
    $cod_usuario = null, 
    $client_ip = null, 
    $datetime_entrada = null, 
    $datetime_salida = null,
) {
    $bd = obtenerConexion();

    $nombre_tabla = "{{.CORE}}.mto_usuarios_sesiones";
    $datos = [
        "cod_usuario" => $cod_usuario, 
        "ip" => $client_ip, 
        "entrada" => $datetime_entrada, 
        "salida" => $datetime_salida
    ];
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, true);
}

function cerrarUltimaSesion($cod_usuario, $salida)
{
	$bd = obtenerConexion();

	$entrada = obtenerUltimaEntrada($cod_usuario);
	$entrada = $entrada[0]->entrada;

    $nombre_tabla = "{{.CORE}}.mto_usuarios_sesiones";
    $datos = [ "salida" => $salida ];
    $datos_condicionales = [ 
        "cod_usuario" => $cod_usuario,
        "entrada" => $entrada,
        "salida" => [
            "operador" => "IS",
            "valor" => "NULL"
        ],
    ];
    return modificarDatosTabla(
        $bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales
    );
}

function obtenerLogAccionesParam(
    $cod_accion,
    $desc_accion = null,
    $cod_modulo = null
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = "SELECT * FROM {{.CORE}}.mto_usuarios_log_acciones WHERE 1 ";

    if ($cod_accion != null) {
        $sql .= "AND accion = ? ";
        $values[] = $cod_accion;
    }

    if ($desc_accion != null) {
        $sql .= "AND desc_accion LIKE ? ";
        $values[] = "%$desc_accion%";
    }

    if ($cod_modulo != null) {
        $sql .= "AND cod_modulo = ? ";
        $values[] = $cod_modulo;
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function insertLogUsuario(
    $cod_usuario = null, 
    $cod_accion = null, 
    $modulo = null, 
    $seccion = null, 
    $datetime = null, 
    $extra_data = null, 
    $cod_sesion = null,
) {
    $SALIDA = "CIERRE";
    $ENTRADA = "ACCESO";

    $bd = obtenerConexion();
    if ($datetime == null) {
        $datetime = date("Y-m-d H:i:s");
    }
    $datetime_explode = explode(" ", $datetime);
    $datetime_salida = null;
    [$date, $time] = $datetime_explode;

    $accion = obtenerLogAccionesParam($cod_accion);
    if (is_array($accion) && !empty($accion)) {
        $cod_accion = $accion[0]->cod_accion;
        $accion = $accion[0]->desc_accion;
    } else {
        return array(
            "message" => "Código de acción inválido",
            "error" => true
        );
    }

    if ($accion == $SALIDA) {
        $datetime_salida = date("Y-m-d H:i:s", time());

        cerrarUltimaSesion($cod_usuario, $datetime_salida, $cod_sesion);
    } else if ($accion == $ENTRADA) {
        $datetime_entrada = date("Y-m-d H:i:s", time());

        if ($datetime != null && $datetime_entrada > $datetime)
            $datetime_entrada = $datetime;

        $client_ip = $_SERVER["REMOTE_ADDR"];

        cerrarUltimaSesion($cod_usuario, $datetime_entrada);

        crearSesionUsuario($cod_usuario, $client_ip, $datetime_entrada, $datetime_salida);
    }

    $cod_sesion = obtenerCodSesion($cod_usuario);

    if ($cod_sesion == null) {
        return ["message" => "Sesión desconocida", "error" => true];
    }

    if ($seccion != null) {
        $s = obtenerSeccionesParam(nombre_seccion: $seccion);
        $cod_seccion = $s[0]->cod_seccion ?? null;
    }

    if ($modulo != null) {
        $cod_modulo = MODULOS[$modulo]["cod_modulo"];
    }

    $nombre_tabla = "{{.CORE}}.mto_usuarios_log";
    $campos = [
        "cod_sesion" => $cod_sesion, 
        "cod_accion" => $cod_accion, 
        "cod_modulo " => $cod_modulo ?? null, 
        "cod_seccion " => $cod_seccion ?? null, 
        "fecha" => $date, 
        "hora" => $time, 
        "extra_data" => $extra_data
    ];
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos);
}

function autenticacion2FA($cod_usuario) {
    $bd = obtenerConexion();
    try {
        $sql = "SELECT email FROM {{.CORE}}.usuarios WHERE cod_usuario = ?";
        $resultados = ejecutarConsultaSQL($bd, $sql, [$cod_usuario], true);
    } catch (Exception $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }

    if (empty($resultados)) {
        return ["message" => "No se han encontrado resultados.", "error" => true];
    }

    $emailUsuario = $resultados[0]->email;

    if ($emailUsuario == null) {
        return ["message" =>  "El usuario no tiene un email guardado.", "error" => true];
    }

    $codigoRandom = generarCodigoRandom();
    try {
        $subject = "Código de confirmación: $codigoRandom";
        $body = "<h1>Confirma tu dirección de correo electrónico</h1>
        <h3><b><u>$codigoRandom</u></b> es tu código de confirmación, ¡introdúcelo para confirmar que eres tú!</h3>";

        $mail = enviarCorreo(
            subject: $subject, 
            body: $body, 
            address: $emailUsuario,
            isHTML: true,
        );

        return $mail ? $codigoRandom : false;
    } catch (Exception $e) {
        return null;
    }
}

function insertLogUsuario2FA($cod_usuario, $cod_accion, $recuperarPwd = false) {
    $bd = obtenerConexion();
    $fecha_hora = date("Y-m-d H:i:s");
    [$fecha, $hora] = explode(" ", $fecha_hora);

    $accion = obtenerLogAccionesParam($cod_accion);
    if (!(is_array($accion) && !empty($accion))) {
        http_response_code(500);
        return array(
            "message" => "Código de acción inválido",
            "error" => true
        );
    }
    $cod_accion = $accion[0]->cod_accion;

    $codigoRandomUsuario = autenticacion2FA($cod_usuario);
    if (
        is_array($codigoRandomUsuario) &&
            isset($codigoRandomUsuario["error"])
    ) {
        return $codigoRandomUsuario;
    }

    $cod_sesion = obtenerCodSesion($cod_usuario);
    if ($cod_sesion == null && !$recuperarPwd) {
        http_response_code(500);
        return array(
            "message" => "Sesión desconocida",
            "error" => true
        );
    }

    if ($recuperarPwd) {
        $client_ip = $_SERVER["REMOTE_ADDR"];

        $cod_sesion = crearSesionUsuario(
            cod_usuario: $cod_usuario, 
            client_ip: $client_ip, 
            datetime_entrada: $fecha_hora,
        );
    }

    $nombre_tabla = "{{.CORE}}.mto_usuarios_log";
    $campos = [
        "cod_sesion" => $cod_sesion, 
        "cod_2fa " => $codigoRandomUsuario,
        "cod_accion" => $cod_accion, 
        "fecha" => $fecha, 
        "hora" => $hora, 
    ];
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos);
}

function obtenerLogsUsuario(
    $cod_usuario = null, 
    $cod_sesion = null, 
    $accion = null, 
    $cod_accion = null, 
    $desc_accion = null, 
    $hora_ini = null, 
    $hora_fin = null, 
    $fecha_ini = null, 
    $fecha_fin = null, 
    $limit = null,
) {
    $values = [];
    $bd = obtenerConexion();
    $sql = "SELECT 
        l.cod_log, l.extra_data, s.ip, l.cod_2fa, a.desc_accion, a.accion, l.cod_modulo,
        m.abreviacion as abreviacion_modulo, m.nombre_modulo as modulo, l.cod_seccion, 
        sc.abreviacion as abreviacion_seccion, sc.nombre_seccion, l.fecha, l.hora 
    FROM {{.CORE}}.mto_usuarios_sesiones s 
	INNER JOIN {{.CORE}}.mto_usuarios_log l ON s.cod_sesion = l.cod_sesion
	INNER JOIN {{.CORE}}.mto_usuarios_log_acciones a ON a.cod_accion = l.cod_accion 
	LEFT JOIN {{.CORE}}.modulos m ON l.cod_modulo = m.cod_modulo 
	LEFT JOIN {{.CORE}}.modulos_seccion sc ON sc.cod_seccion = l.cod_seccion 
	WHERE 1 ";

    if ($cod_sesion) {
        $sql .= 'AND l.cod_sesion = ? ';
        $values[] = $cod_sesion;
    }

    if ($cod_usuario) {
        $sql .= 'AND s.cod_usuario = ? ';
        $values[] = $cod_usuario;
    }

    if ($accion) {
        $sql .= 'AND a.accion LIKE ? ';
        $values[] = "%$accion%";
    }

    if ($cod_accion) {
        $sql .= 'AND l.cod_accion LIKE ? ';
        $values[] = "%$cod_accion%";
    }

    if ($desc_accion) {
        $sql .= 'AND a.desc_accion LIKE ? ';
        $values[] = "%$desc_accion%";
    }

    if ($hora_ini && $hora_fin) {
        $sql .= 'AND l.hora BETWEEN ? AND ? ';
        $values[] = $hora_ini;
        $values[] = $hora_fin;
    }
    if ($fecha_ini && $fecha_fin) {
        $sql .= 'AND l.fecha BETWEEN ? AND ? ';
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    }

    $sql .= ' ORDER BY l.fecha DESC, l.hora DESC ';

    if ($limit) {
        $sql .= ' LIMIT ?';
        $values[] = $limit;
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerSesionesLogUsuario(
    $nombre_usuario = null, 
    $ip = null, 
    $fecha_ini = null, 
    $fecha_fin = null, 
    $limit = null, 
    $cod_sesion = null,
) {
    $sql = "SELECT u.nombre_usuario, s.*, COUNT(l.cod_log) AS cantidad_acciones, TIMEDIFF(salida, entrada) AS duracion
    FROM {{.CORE}}.mto_usuarios_sesiones s
	LEFT JOIN {{.CORE}}.mto_usuarios_log l ON s.cod_sesion = l.cod_sesion
	INNER JOIN {{.CORE}}.usuarios u ON u.cod_usuario = s.cod_usuario 
	WHERE 1 ";
    $values = [];

    if ($nombre_usuario) {
        $sql .= "AND u.nombre_usuario LIKE ? ";
        $values[] = "%$nombre_usuario%";
    }

    if ($cod_sesion) {
        $sql .= "AND s.cod_sesion = '$cod_sesion'";
        $values[] = "$cod_sesion";
    }

    if ($ip) {
        $sql .= "AND s.ip LIKE '%$ip%'";
        $values[] = "%$ip%";
    }

    if ($fecha_ini && $fecha_fin) {
        $sql .= "AND (CAST(s.entrada AS DATE) BETWEEN ? AND ? OR CAST(s.salida AS DATE) BETWEEN ? AND ?) ";
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    }

    $sql .= 'GROUP BY cod_sesion ORDER BY entrada DESC ';

    if ($limit) {
        $sql .= "LIMIT ? ";
        $values[] = $limit;
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e, true);
    }
}

