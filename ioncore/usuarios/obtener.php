<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_usuario = $jsonobj2->cod_usuario ?? null;
$login = $jsonobj2->login ?? null;
$password = $jsonobj2->password ?? null;
$nombre = $jsonobj2->nombre ?? null;
$apellidos = $jsonobj2->apellidos ?? null;
$permisos = $jsonobj2->permisos ?? null;
$idioma = $jsonobj2->idioma ?? null;
$email = $jsonobj2->email ?? null;
$telefono = $jsonobj2->telefono ?? null;
$nombre_usuario = $jsonobj2->nombre_usuario ?? null;

acabarRequest(obtenerUsuariosParam(
    $cod_usuario, 
    $nombre_usuario, 
    $login, 
    $permisos, 
    $idioma, 
    $email, 
    $telefono, 
    $nombre, 
    $apellidos,
));
