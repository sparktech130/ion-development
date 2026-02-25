<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/reconocimientos/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_usuario = $jsonobj2->cod_usuario ?? $cod_usuario_token;
$modulos = $jsonobj2->modulos ?? null;

acabarRequest(obtenerReconocimientosDispositivoLimitGrid(
    cod_usuario: $cod_usuario, 
    modulos: $modulos,
));
