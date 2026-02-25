<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/alertas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);
if (!isset($jsonobj2->cod_alertagest)) {
    acabarRequest([
        "message" => "Error al modificar: " . $e->getMessage(),
        "error" => true
    ], 500);
}

$cod_alertagest = $jsonobj2->cod_alertagest ?? null;
$campos_alertagest = $jsonobj2->campos_alertagest ?? null;

$update = modificarAlertaGestion(
    $cod_alertagest, 
    $campos_alertagest,
);

acabarRequest($update);
