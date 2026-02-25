<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/investigaciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$nombre_investigacion = $jsonobj2->nombre_investigacion ?? null;
$descripcion = $jsonobj2->descripcion ?? null;

$coordenadas = $jsonobj2->coordenadas ?? null;
$direccion = null;

if ($coordenadas) {
    $coordenadas = validarCoordenadas($coordenadas);
    if ($coordenadas)
        $direccion = obtenerDireccionCoordenadas($coordenadas);
}

$fecha_hora_ini = new DateTime();
$fecha_hora_ini = $fecha_hora_ini->format("Y-m-d H:i:00");

$insert = insertarInvestigacion(
    nombre_investigacion: $nombre_investigacion,
    descripcion: $descripcion,
    fecha_hora_ini: $fecha_hora_ini,
    coordenadas: $coordenadas,
    direccion: $direccion,
    cod_usuario: $cod_usuario_token
);
acabarRequest($insert);

