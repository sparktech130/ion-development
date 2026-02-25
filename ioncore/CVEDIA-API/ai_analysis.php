<?php

use CVUtils\Utils;

require_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_modulo = $jsonobj2->cod_modulo ?? null;
$cod_categoria = $jsonobj2->cod_categoria ?? null;
$nombre_categoria = $jsonobj2->nombre_categoria ?? null;

$analisis = obtenerAnalisisAreas(
    cod_modulo: $cod_modulo,
    cod_categoria: $cod_categoria,
    nombre_categoria: $nombre_categoria,
);
Utils::acabarRequest($analisis);
