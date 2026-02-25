<?php
$_SESSION["AUTHED"] = false;
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/auth/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_usuario = $jsonobj2->cod_usuario ?? null;
$email = $jsonobj2->email ?? null;
$cod_autenticacion = $jsonobj2->cod_autenticacion ?? null;
$cod_sector = $jsonobj2->cod_sector ?? null;

$comprobar = comprobar2FA(
    $cod_autenticacion, 
    $cod_usuario, 
    $email,
);

if ($comprobar == false) {
    http_response_code(500);
    acabarRequest([ "success" => false ], 500);
}

if (!isset($cod_usuario)) {
    acabarRequest(["success" => $comprobar]);
}

$data = start_session($cod_usuario);
$bearerToken = $data["token"];
$permisos_usuario = $data["permisos"];
$permisos_secciones = obtenerPermisosSecciones(cod_permiso: $permisos_usuario);
$licencias_cliente = obtenerLicenciasCliente(
    servidor: $_ENV["ION_SERVER"],
    estado: [
        ESTADOS_LICENCIA["ESTADO_LICENCIA_ENUSO"],
        ESTADOS_LICENCIA["ESTADO_LICENCIA_PRORROGA"]
    ],
    cod_sector: $cod_sector,
);
$coordenadas_cliente = obtenerCoordenadasCliente(null, $_ENV["ION_SERVER"]);

if (isset($permisos_secciones["error"])) {
    acabarRequest([ "success" => false, ]);
}

acabarRequest([
    "success" => $comprobar,
    "server" => $_ENV["ION_SERVER"],
    "token" => $bearerToken ?? null,
    "permisos" => $permisos_secciones,
    "coordenadas" => $coordenadas_cliente[0]->coordenadas ?? "",
    "licencias" => $licencias_cliente,
]);
