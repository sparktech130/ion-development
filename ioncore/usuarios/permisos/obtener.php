<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_permiso = $jsonobj2->cod_permiso ?? null;
$nombre_permiso = $jsonobj2->nombre_permiso ?? null;
$descripcion = $jsonobj2->descripcion ?? null;
$cod_sector = $jsonobj2->cod_sector ?? null;
$cod_modulo = $jsonobj2->cod_modulo ?? null;
$cod_seccion = $jsonobj2->cod_seccion ?? null;

acabarRequest(obtenerPermisosUsuarios(
    cod_permiso: $cod_permiso, 
    nombre_permiso: $nombre_permiso, 
    descripcion: $descripcion, 
    cod_sector: $cod_sector, 
    cod_modulo: $cod_modulo, 
    cod_seccion: $cod_seccion,
));

