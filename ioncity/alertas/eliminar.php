<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/alertas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_alerta = $jsonobj2->cod_alerta ?? null;

$delete = eliminarAlerta($cod_alerta);

$status = 200;
if ($delete == false) {
    $status = 500;
}

acabarRequest($delete, $status);

