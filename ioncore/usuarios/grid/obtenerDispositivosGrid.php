<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_usuario = $jsonobj2->cod_usuario ?? $cod_usuario_token;
$cod_modulo = $jsonobj2->cod_modulo ?? null;
$cod_grid = $jsonobj2->cod_grid ?? null;

acabarRequest(obtenerDispositivosGrid(
    $cod_usuario, 
    $cod_modulo, 
    $cod_grid,
));
