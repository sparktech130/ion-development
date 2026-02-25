<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/licencias/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$clave_licencia = $jsonobj2->clave_licencia ?? null;
$modulo = $jsonobj2->modulo ?? null;
$seccion = $jsonobj2->seccion ?? null;
$cod_sector = $jsonobj2->cod_sector ?? null;
$canales = $jsonobj2->canales ?? null;
$estado = $jsonobj2->estado ?? null;
$nombre_cliente = $jsonobj2->nombre_cliente ?? null;
$servidor = $jsonobj2->servidor ?? null;
$fecha_ini = $jsonobj2->fecha_ini ?? null;
$fecha_fin = $jsonobj2->fecha_fin ?? null;

if (!in_array($_ENV["ION_SERVER"], ["ionsmart.eu", "ionsmart.cat"])) {
    $servidor = $_ENV["ION_SERVER"];
}

acabarRequest(obtenerLicenciasParam(
    clave_licencia: $clave_licencia, 
    nombre_modulo: $modulo, 
    seccion: $seccion, 
    cod_sector: $cod_sector, 
    canales: $canales, 
    estado: $estado, 
    nombre_cliente: $nombre_cliente, 
    servidor: $servidor, 
    fecha_ini: $fecha_ini, 
    fecha_fin: $fecha_fin,
));

