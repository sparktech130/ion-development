<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/main.php";

// Configuración
$_SESSION["FD"] = (object)[
    "host" => $_ENV["FD_HOST"],
    "user" => $_ENV["FD_USER"],
    "password" => $_ENV["FD_PASSWORD"],
    "token" => null,
    "loc" => null,
    "verify" => false, // en producción true + CA
    "apiV" => "0.9"
];

try {
    fd_crear_sesion_token();
} catch (Exception $e) {
    $m = $e->getMessage();
    $returnObj = [
        "message" => "Ha habido un error al procesar la solicitud: {$m}",
        "error" => true,
    ];
}
