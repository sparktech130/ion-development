<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_accion = $jsonobj2->cod_accion ?? null;
$desc_accion = $jsonobj2->desc_accion ?? null;
$cod_modulo = $jsonobj2->cod_modulo ?? null;

acabarRequest(obtenerLogAccionesParam($cod_accion, $desc_accion, $cod_modulo));
