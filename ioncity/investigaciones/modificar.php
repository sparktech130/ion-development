<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/investigaciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_investigacion = $jsonobj2->cod_investigacion ?? null;
$nombre_investigacion = $jsonobj2->nombre_investigacion ?? null;
$descripcion = $jsonobj2->descripcion ?? null;
$finalizar = $jsonobj2->finalizar ?? false;
$reabrir = $jsonobj2->reabrir ?? false;

$coordenadas = $jsonobj2->coordenadas ?? null;
$direccion = null;

if ($coordenadas) {
    $coordenadas = validarCoordenadas($coordenadas);
    if ($coordenadas)
        $direccion = obtenerDireccionCoordenadas($coordenadas);
}


$fecha_hora_fin = null;

if ($finalizar === true) {
    $fecha_hora_fin = new DateTime();
    $fecha_hora_fin = $fecha_hora_fin->format("Y-m-d H:i:00");
} else if ($reabrir === true) {
    $fecha_hora_fin = "VACIAR";
}

$update = modificarInvestigacion(
    cod_investigacion: $cod_investigacion,
    nombre_investigacion: $nombre_investigacion,
    descripcion: $descripcion,
    fecha_hora_fin: $fecha_hora_fin,
    coordenadas: $coordenadas,
    direccion: $direccion,
);
acabarRequest($update);

