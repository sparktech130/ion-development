<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$usuarioNoAutorizado = [
	"message" => "Usuario no autorizado",
	"error" => true,
	"code" => 401
];

$usuarioInvalido = [
	"message" => "Usuario inválido",
	"error" => true,
	"code" => 401
];

$sesionExpirada = [
	"message" => "Token expirado o inválido",
	"error" => true,
	"code" => 498
];

function loginThirdParty($username, $password) {
	$bd = obtenerConexion();
    $sql = "SELECT 
        u.cod_usuario, u.login, u.nombre_usuario, u.password, u.permisos, p.nombre_permiso 
	FROM {{.CORE}}.usuarios u 
    LEFT JOIN {{.CORE}}.usuarios_permisos p ON u.permisos = p.cod_permiso 
    WHERE nombre_usuario = ? AND password = ? ";
    $values[] = $username;
    $values[] = hash("sha256", $password);

	try {
        $user = ejecutarConsultaSQL($bd, $sql, $values, true);
        return !empty($user);
	} catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
	}
}

function decodeJWTToken($token)
{
	try {
		$secretKey = $_ENV["SECRET_KEY"];
		$decodeKey = new Key($secretKey, "HS256");

		return JWT::decode($token, $decodeKey);
	} catch (Throwable) {
		return false;
	}
}

function obtenerHeaderAutenticacion(): ?string {
    if (isset($_SERVER["HTTP_AUTHORIZATION"])) {
        return $_SERVER["HTTP_AUTHORIZATION"];
    }

    if (function_exists("getallheaders")) {
        $headers = getallheaders();
        if (isset($headers["Authorization"])) {
            return $headers["Authorization"];
        }
    }

    if (isset($_GET["token"])) {
        return "Bearer {$_GET["token"]}";
    }

    return null;
}
