<?php
$_SESSION["AUTHED"] = false;
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/auth/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$email = $jsonobj2->email ?? null;
$cod_autenticacion = $jsonobj2->cod_autenticacion ?? null;
$password = $jsonobj2->password ?? null;

$cambio = cambiarPassword2FA($email, $cod_autenticacion, $password);

acabarRequest($cambio);
