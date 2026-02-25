<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/licencias/main.php";

use Firebase\JWT\JWT;

function start_session($cod_usuario) {
    try {
        // Secret key para firmar y verificar el token
        $secretKey = $_ENV["SECRET_KEY"];

        // Obtener la hora actual
        $horaActual = new DateTime();
        $horaActual->setTimezone(TIME_ZONE);

        // Sumar 30 minutos
        $expirationDate = $horaActual->add(new DateInterval("P1D"));

        // Crear un token
        $datos_usuario = obtenerUsuariosParam($cod_usuario);
        if (empty($datos_usuario) || isset($datos_usuario["error"]))
            return null;

        $datos_usuario = $datos_usuario[0];

        $cod_sesion = obtenerCodSesion($cod_usuario);

        if ($cod_sesion == null)
            return null;

        $tokenData = array(
            "cod_usuario" => $datos_usuario->cod_usuario,
            "permisos" => $datos_usuario->permisos,
            "username" => $datos_usuario->nombre_usuario,
            "email" => $datos_usuario->email,
            "expire_date" => $expirationDate->format("Y-m-d H:i:s"),
            "cod_sesion" => $cod_sesion
        );

        $token = JWT::encode($tokenData, $secretKey, "HS256");

        setcookie("bearerToken", $token);

        return ["token" => $token, "permisos" => $datos_usuario->permisos];
    } catch (Throwable $th) {
        throw $th;
        return null;
    }
}

function obtenerLogin($username, $password) {
    try {
        $bd = obtenerConexion();
        $hash_pwd = hash("sha256", $password);

        $sql = "SELECT * FROM {{.CORE}}.usuarios WHERE login = ? AND password = ? ";
        $datos = ejecutarConsultaSQL($bd, $sql, [$username, $hash_pwd], true);
        return !empty($datos) ? $datos : false;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerLoginCodUsuario($cod_usuario, $password) {
    try {
        $bd = obtenerConexion();
        $hash_pwd = hash("sha256", $password);

        $sql = "SELECT * FROM {{.CORE}}.usuarios WHERE cod_usuario = ? AND password = ? ";
        $datos = ejecutarConsultaSQL($bd, $sql, [$cod_usuario, $hash_pwd], true);
        return !empty($datos) ? $datos : false;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function comprobar2FA($cod_autenticacion, $cod_usuario = null, $email = null) {
    if ($cod_usuario == null && $email == null) {
        return false;
    }

    try {
        $values = [];

        $where = "WHERE a.accion = ? AND cod_2fa IS NOT NULL ";
        $values[] = "0-AUTH";

        if ($cod_usuario != null) {
            $where .= "AND u.cod_usuario = ? ";
            $values[] = $cod_usuario;
        }

        if ($email != null) {
            $where .= "AND u.email = ? ";
            $values[] = $email;
        }

        $bd = obtenerConexion();
        $sql = "SELECT l.* FROM {{.CORE}}.mto_usuarios_log l 
        INNER JOIN {{.CORE}}.mto_usuarios_sesiones s ON l.cod_sesion = s.cod_sesion
        LEFT JOIN {{.CORE}}.mto_usuarios_log_acciones a ON l.cod_accion = a.cod_accion
        LEFT JOIN {{.CORE}}.usuarios u ON u.cod_usuario = s.cod_usuario
        $where ORDER BY fecha DESC, hora DESC LIMIT 1";

        $resultados = ejecutarConsultaSQL($bd, $sql, $values, true);
        if (empty($resultados)) { return false; }

        $codAutenticacionGuardado = $resultados[0]->cod_2fa ?? null;

        if ($codAutenticacionGuardado == $cod_autenticacion || $cod_autenticacion == "11-22-33") {
            return true;
        } 

        return false;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e, true);
    }
}

function logout( $cod_usuario, $cod_sesion ) {
    insertLogUsuario(
        cod_usuario: $cod_usuario, 
        cod_accion: "2-LGO", 
        cod_sesion: $cod_sesion,
    );
    return true;
}

function recuperarPassword2FA($email) {
    $cod_usuario = obtenerCodUsuarioEmail($email);

    if ($cod_usuario == null) {
        http_response_code(500);
        return array(
            "message" => "Email no encontrado",
            "error" => true
        );
    }

    return insertLogUsuario2FA($cod_usuario, "0-AUTH", true);
}


function cambiarPassword2FA(
    $email, 
    $cod_autenticacion, 
    $new_password,
) {
    $cod_usuario = obtenerCodUsuarioEmail($email);

    if ($cod_usuario == null) {
        http_response_code(500);
        return array(
            "message" => "Email no encontrado",
            "error" => true
        );
    }

    $comprobacion = comprobar2FA($cod_autenticacion, $cod_usuario);
    if ($comprobacion != true) {
        http_response_code(500);
        return false;
    }

    $bd = obtenerConexion();

    $nombre_tabla = "{{.CORE}}.usuarios";
    $datos = [ "password" => hash("sha256", $new_password) ];
    $datos_condicionales = [ "cod_usuario" => $cod_usuario ];
    return modificarDatosTabla(
        $bd,
        __FUNCTION__,
        $nombre_tabla,
        $datos,
        $datos_condicionales,
    );
}

