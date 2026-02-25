<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_permiso = $jsonobj2->cod_permiso ?? null;

if (!isset($cod_permiso)){
    acabarRequest(errorAlObtenerDatos(__FUNCTION__, "update", $e), 500);
}

$nombre_permiso = $jsonobj2->nombre_permiso ?? null;
$descripcion = $jsonobj2->descripcion ?? null;
$secciones = $jsonobj2->secciones ?? null;
$clouds = $jsonobj2->clouds ?? null;

acabarRequest(modificarPermisos(
    cod_permiso: $cod_permiso, 
    nombre_permiso: $nombre_permiso, 
    descripcion: $descripcion, 
    secciones: $secciones, 
    clouds: $clouds,
));

