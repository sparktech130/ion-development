<?php
$_SESSION["AUTHED"] = false;
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/auth/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$email = $jsonobj2->email ?? null;

$recuperacion = recuperarPassword2FA($email);

if ($recuperacion == false){
    http_response_code(500);
}

acabarRequest($recuperacion);
