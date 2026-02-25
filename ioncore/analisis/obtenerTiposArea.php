<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/analisis/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_modulo = $jsonobj2->cod_modulo ?? null;

$tipos = obtenerTiposAreaAnalisisParam($cod_modulo);

acabarRequest($tipos);

