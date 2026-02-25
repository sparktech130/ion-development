<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/integraciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_integracion = $jsonobj2->cod_integracion ?? null;
$nombre = $jsonobj2->nombre ?? null;

$rows = obtenerIntegraciones(
    cod_integracion: $cod_integracion,
    nombre: $nombre,
);
acabarRequest($rows);
