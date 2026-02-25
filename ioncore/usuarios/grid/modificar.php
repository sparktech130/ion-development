<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_grid = $jsonobj2->cod_grid ?? null;
$nombre_grid = $jsonobj2->nombre_grid ?? null;
$cod_usuario = $jsonobj2->cod_usuario ?? $cod_usuario_token;
$dispositivos = $jsonobj2->dispositivos ?? null;
$modulos = $jsonobj2->modulos ?? null;

$update = modificarGridUsuarios(
    $cod_grid,
    $nombre_grid,
    $cod_usuario,
    $dispositivos,
    $modulos
);

acabarRequest($update);
