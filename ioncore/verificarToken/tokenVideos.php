<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/verificarToken/main.php";

if (isset($_SESSION["AUTHED"]) && $_SESSION["AUTHED"] === false) { 
    return;
}

if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    acabarRequest(401, $usuarioNoAutorizado);
}

$authorizationHeader = $_SERVER['HTTP_AUTHORIZATION'];

[$tipo, $token] = explode(' ', $authorizationHeader);

if ($tipo !== 'Bearer') {
    acabarRequest(401, $usuarioNoAutorizado);
}

$tokenData = decodeJWTToken($token);
if (!$tokenData)
    acabarRequest(401, $usuarioNoAutorizado);

$email_usuario_token = $tokenData->email ?? null;
if ($email_usuario_token == null) {
    acabarRequest(498, $sesionExpirada);
}

