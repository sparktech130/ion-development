<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/verificarToken/main.php";

if (isset($_SESSION["AUTHED"]) && $_SESSION["AUTHED"] === false) { 
    return;
}

if (isset($_SESSION["AUTH_TYPE"]) && $_SESSION["AUTH_TYPE"] === "vms") {
    return;
}

$authorizationHeader = obtenerHeaderAutenticacion();

if ($authorizationHeader === null) {
	acabarRequest($usuarioNoAutorizado, 401);
}

[$tipo, $token] = explode(" ", $authorizationHeader);

if ($tipo === "Basic") {
    [$username, $password] = explode(":", base64_decode($token));

    $login = loginThirdParty($username, $password);
    if (!$login) {
        acabarRequest($usuarioNoAutorizado, 401); 
    }
    return;
} else if ($tipo !== "Bearer") {
    acabarRequest($usuarioNoAutorizado, 401);
}

$tokenData = decodeJWTToken($token);
if (!$tokenData) {
    acabarRequest($usuarioNoAutorizado, 401);
}

$email_usuario_token = $tokenData->email ?? null;
$expire_date = $tokenData->expire_date ?? null;
$cod_sesion = $tokenData->cod_sesion ?? null;

if ($email_usuario_token == null || $expire_date == null) {
	acabarRequest($sesionExpirada, 498);
} else if (comprobarUsuarioValido($email_usuario_token) !== true) {
	acabarRequest($usuarioInvalido, 401);
} else if (comprobarSesionUsuario($cod_sesion) !== true) {
	acabarRequest($sesionExpirada, 498);
}

// Token válido
$cod_sesion_usuario = $cod_sesion;
$cod_usuario_token = $tokenData->cod_usuario;
$permisos_usuario = $tokenData->permisos ?? null;

$_SESSION["cod_sesion_usuario"] = $cod_sesion;
$_SESSION["cod_usuario_token"] = $cod_usuario_token;
$_SESSION["permisos_usuario"] = $permisos_usuario;

