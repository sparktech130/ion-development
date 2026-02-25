<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$nombre_permiso = $jsonobj2->nombre_permiso ?? null;
$descripcion = $jsonobj2->descripcion ?? null;
$secciones = $jsonobj2->secciones ?? null;
$clouds = $jsonobj2->clouds ?? null;

acabarRequest(insertarPermisos(
    $nombre_permiso, 
    $descripcion, 
    $secciones, 
    $clouds,
));

