<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$nombre_grid = null;
$cod_usuario = $cod_usuario_token;
$dispositivos = null;
$modulos = null;

if (isset($jsonobj2->nombre_grid)) {
    $nombre_grid = $jsonobj2->nombre_grid;
}

if (isset($jsonobj2->cod_usuario)) {
    $cod_usuario = $jsonobj2->cod_usuario;
}

if (isset($jsonobj2->dispositivos)) {
    $dispositivos = $jsonobj2->dispositivos;
}

if (isset($jsonobj2->modulos)) {
    $modulos = $jsonobj2->modulos;
}

$insert = insertarGridUsuarios(
    $nombre_grid,
    $cod_usuario,
    $dispositivos,
    $modulos
);

acabarRequest($insert);
