<?php

require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/logs/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/permisos/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/grid/main.php";

use PHPMailer\PHPMailer\Exception as PHPMailerException;

function obtenerUsuariosParam(
    $cod_usuario = null,
    $nombre_usuario = null,
    $login = null,
    $permisos = null,
    $idioma = null,
    $email = null,
    $telefono = null,
    $nombre = null,
    $apellidos = null,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = "SELECT 
        u.cod_usuario, u.login, u.nombre_usuario, u.foto_perfil, u.nombre, u.apellidos, 
        u.idioma, u.email, u.telefono, u.permisos, p.nombre_permiso, u.ioncop_access
	FROM {{.CORE}}.usuarios u 
	LEFT JOIN {{.CORE}}.usuarios_permisos p ON u.permisos = p.cod_permiso WHERE 1 ";

    if ($cod_usuario != null) {
        $sql .= "AND u.cod_usuario = ? ";
        $values[] = $cod_usuario;
    }

    if ($login != null) {
        $sql .= "AND u.login LIKE ? ";
        $values[] = "%$login%";
    }

    if ($nombre_usuario != null) {
        $sql .= "AND u.nombre_usuario LIKE ? ";
        $values[] = "%$nombre_usuario%";
    }

    if ($permisos != null) {
        $sql .= "AND p.nombre_permiso LIKE ? ";
        $values[] = "%$permisos%";
    }

    if ($nombre != null) {
        $sql .= "AND nombre LIKE ? ";
        $values[] = "%$nombre%";
    }

    if ($apellidos != null) {
        $sql .= "AND apellidos LIKE ? ";
        $values[] = "%$apellidos%";
    }

    if ($idioma != null) {
        $sql .= "AND idioma = ? ";
        $values[] = $idioma;
    }

    if ($email != null) {
        $sql .= "AND email LIKE ? ";
        $values[] = "%$email%";
    }

    if ($telefono != null) {
        $sql .= "AND telefono LIKE ? ";
        $values[] = "%$telefono%";
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerCodUsuarioEmail($email)
{
    try {
        $bd = obtenerConexion();

        $sql = "SELECT cod_usuario FROM {{.CORE}}.usuarios WHERE email = ?";
        $values = [$email];

        $result = ejecutarConsultaSQL($bd, $sql, $values, true);
        if (isset($result[0]->cod_usuario)) {
            return $result[0]->cod_usuario;
        }

        return null;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function comprobarUsuarioValido($email)
{
    if (!$email) return false;

    $user = obtenerUsuariosParam(email: $email);
    return (
        $user != null &&
        is_array($user) &&
        !empty($user)
    );
}

function obtenerSesionUsuario($cod_sesion)
{
    $bd = obtenerConexion();
    $sql = "SELECT s.*
    FROM {{.CORE}}.mto_usuarios_sesiones s
	WHERE 1 ";
    $values = [];

    if ($cod_sesion) {
        $sql .= "AND s.cod_sesion = ? ";
        $values[] = $cod_sesion;
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function comprobarSesionUsuario($cod_sesion)
{
    $sesiones = obtenerSesionUsuario($cod_sesion);

    if (isset($sesiones[0]->salida)) {
        return false;
    }
    return true;
}

function obtenerPermisosSecciones(
    $cod_permiso = null,
    $nombre_permiso = null,
    $descripcion = null,
    $cod_sector = null,
    $cod_modulo = null,
    $cod_seccion = null,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT DISTINCT
			p.cod_permiso, 
			ps.acceso, ps.consultas, ps.editar, ps.compartir, ps.cod_seccion, 
			s.abreviacion, s.cod_front, s.nombre_seccion, s.cod_modulo,
			m.nombre_modulo, sv.cod_sector, sv.nombre_sector
		FROM {{.CORE}}.usuarios_permisos p 
		RIGHT JOIN {{.CORE}}.usuarios_permisos_secciones ps ON p.cod_permiso = ps.cod_permiso
		LEFT JOIN {{.CORE}}.modulos_seccion s ON ps.cod_seccion = s.cod_seccion
		LEFT JOIN {{.CORE}}.modulos m ON m.cod_modulo = s.cod_modulo
		LEFT JOIN {{.CORE}}.sectores_verticales sv ON m.cod_sector = sv.cod_sector
		WHERE 1 ";

    if ($cod_permiso) {
        $sql .= "AND ps.cod_permiso = ? ";
        $values[] = "$cod_permiso";
    }

    if ($cod_sector) {
        $sql .= "AND (sv.cod_sector = ? OR sv.cod_sector IS NULL) ";
        $values[] = "$cod_sector";
    }

    if ($cod_modulo) {
        $sql .= "AND ps.cod_modulo = ? ";
        $values[] = "$cod_modulo";
    }

    if ($cod_seccion) {
        $sql .= "AND ps.cod_seccion = ? ";
        $values[] = "$cod_seccion";
    }

    if ($nombre_permiso) {
        $sql .= "AND p.nombre_permiso LIKE ? ";
        $values[] = "%$nombre_permiso%";
    }

    if ($descripcion) {
        $sql .= "AND p.descripcion LIKE ? ";
        $values[] = "%$descripcion%";
    }

    $sql .= " GROUP BY p.cod_permiso, ps.cod_seccion";

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function comprobarDatosRepetidosUsuario(
    $login,
    $nombre_usuario,
    $email,
    $cod_usuario = null,
) {
    $bd = obtenerConexion();

    $camposRepetidos = [];
    $repetidos = 0;
    $values = [];

    $queryCod = "";
    if ($cod_usuario) {
        $queryCod = " AND cod_usuario != ? ";
        $values[] = $cod_usuario;
    }

    $consultas = [
        [
            "consulta" => "SELECT COUNT(*) AS repetidos, 'login' as campo 
            FROM {{.CORE}}.usuarios WHERE login = ?",
            "values" => [$login, ...$values],
        ],
        [
            "consulta" => "SELECT COUNT(*) AS repetidos, 'nombre_usuario' as campo 
            FROM {{.CORE}}.usuarios WHERE nombre_usuario = ?",
            "values" => [$nombre_usuario, ...$values],
        ],
        [
            "consulta" => "SELECT COUNT(*) AS repetidos, 'email' as campo 
            FROM {{.CORE}}.usuarios WHERE email = ?",
            "values" => [$email, ...$values],
        ],
    ];

    try {
        for ($i = 0; $i < 3; $i++) {
            $sql = $consultas[$i]["consulta"] . $queryCod;
            $result = ejecutarConsultaSQL($bd, $sql, $consultas[$i]["values"], true);

            if ($result[0]->repetidos > 0) {
                $repetidos++;
                array_push($camposRepetidos, $result[0]->campo);
            }
        }
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }

    return array(
        "cantidad_repetidos" => $repetidos,
        "campos_repetidos" => $camposRepetidos
    );
}


// CRUD Usuarios.
function insertarUsuarios(
    $login = null,
    $nombre_usuario = null,
    $foto_perfil = null,
    $password = null,
    $permisos = null,
    $idioma = null,
    $email = null,
    $telefono = null,
    $nombre = null,
    $apellidos = null,
    $ioncop_access = false,
) {
    $repetido = comprobarDatosRepetidosUsuario($login, $nombre_usuario, $email);

    if ($repetido["cantidad_repetidos"] > 0) {
        return $repetido;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.usuarios";
    $datos = [
        "login" => $login,
        "nombre_usuario" => $nombre_usuario,
        "nombre" => $nombre,
        "apellidos" => $apellidos,
        "foto_perfil" => $foto_perfil,
        "password" => hash("sha256", $password),
        "permisos" => $permisos,
        "idioma" => $idioma,
        "email" => $email,
        "telefono" => $telefono,
        "ioncop_access" => $ioncop_access,
    ];
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos);
}

function modificarUsuarios(
    $login = null,
    $nombre_usuario = null,
    $foto_perfil = null,
    $password = null,
    $permisos = null,
    $idioma = null,
    $email = null,
    $telefono = null,
    $nombre = null,
    $apellidos = null,
    $cod_usuario = null,
    $ioncop_access = false,
) {
    if (!$cod_usuario) {
        return false;
    }

    $repetido = comprobarDatosRepetidosUsuario($login, $nombre_usuario, $email, $cod_usuario);
    if ($repetido["cantidad_repetidos"] > 0) {
        return $repetido;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.usuarios";
    $datos = [
        "login" => $login,
        "nombre_usuario" => $nombre_usuario,
        "nombre" => $nombre,
        "apellidos" => $apellidos,
        "foto_perfil" => $foto_perfil,
        "password" => $password ? hash("sha256", $password) : null,
        "permisos" => $permisos,
        "idioma" => $idioma,
        "email" => $email,
        "telefono" => $telefono,
        "ioncop_access" => $ioncop_access,
    ];
    $datos_condicionales = ["cod_usuario" => $cod_usuario];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

function modificarPasswordUsuario(
    $old_password = null,
    $new_password = null,
    $cod_usuario = null,
) {
    $login = obtenerLoginCodUsuario(
        cod_usuario: $cod_usuario,
        password: $old_password,
    );

    if (!$login) {
        http_response_code(500);
        return ["message" => "La contraseña introducida no coincide", "error" => true];
    }

    try {
        $bd = obtenerConexion();
        $nombre_tabla = "{{.CORE}}.usuarios";
        $datos = ["password" => hash("sha256", $new_password)];
        $datos_condicionales = ["cod_usuario" => $cod_usuario];
        return modificarDatosTabla(
            $bd,
            __FUNCTION__,
            $nombre_tabla,
            $datos,
            $datos_condicionales
        );
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "update", $e);
    }
}

function eliminarUsuarios($cod_usuario)
{
    if (!$cod_usuario) return false;

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.usuarios";
    $datos_condicionales = ["cod_usuario" => $cod_usuario];

    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function enviarCorreoPassword(
    $email,
    $nombre,
    $login,
    $passwordGenerada,
) {
    try {
        $subject = "Contraseña aleatoria generada.";
        $body = "
			<html>
                <body>
                    <h1>Hola {$nombre},</h1>
                    <p>Tu nombre de usuario: <strong>{$login}</strong></p>
                    <p>Tu contraseña para acceder es: <strong>{$passwordGenerada}</strong></p>
                    <p>Utiliza esta contraseña para iniciar sesión en tu cuenta.</p>
                    <p>¡Gracias y bienvenido!</p>
                </body>
			</html>
		";

        return enviarCorreo(
            subject: $subject,
            body: $body,
            address: $email,
            isHTML: true,
        );
    } catch (PHPMailerException) {
        return null;
    }
}
