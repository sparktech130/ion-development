<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonDecode = json_decode($jsonobj);

$old_password = $jsonDecode->old_password ?? null;
$new_password = $jsonDecode->new_password ?? null;
$cod_usuario = $jsonDecode->cod_usuario ?? null;

acabarRequest(modificarPasswordUsuario(
    $old_password, 
    $new_password, 
    $cod_usuario,
));
