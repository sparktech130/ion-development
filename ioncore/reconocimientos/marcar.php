<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/reconocimientos/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_reconoc = $jsonobj2->cod_reconoc ?? null;

$mark = marcarReconocimiento(
    cod_reconoc: $cod_reconoc,
    cod_usuario: $cod_usuario_token ?? null,
);
acabarRequest($mark);
