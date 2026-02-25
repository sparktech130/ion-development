<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/provincias/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$nombre_pais = $jsonobj2->nombre_pais ?? null;
$iso_numerico = $jsonobj2->iso_numerico ?? null;
$alfa2 = $jsonobj2->alfa2 ?? null;
$alfa3 = $jsonobj2->alfa3 ?? null;

acabarRequest(obtenerPaisesParam(
    nombre_pais: $nombre_pais, 
    iso_numerico: $iso_numerico, 
    alfa2: $alfa2, 
    alfa3: $alfa3,
));

