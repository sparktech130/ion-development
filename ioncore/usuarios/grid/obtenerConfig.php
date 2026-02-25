<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_usuario = $jsonobj2->cod_usuario ?? $cod_usuario_token;

acabarRequest(obtenerConfigUsrGrid($cod_usuario));
