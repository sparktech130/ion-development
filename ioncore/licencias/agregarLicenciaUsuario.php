<?php
include_once $_SERVER['DOCUMENT_ROOT'] . "/core/licencias/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

if (!isset($jsonobj2->clave_licencia)) {
    acabarRequest(false, 500);
}

$clave_licencia = $jsonobj2->clave_licencia ?? null;

$addLicense = agregarLicenciaUsuario($clave_licencia);
acabarRequestSinSalir($addLicense);

// Si es true, comprobar licencias modulos caducadas, y restablecer canales
if ($addLicense === true) {
    include_once "cambiarEstadoLicencias.php";
}


