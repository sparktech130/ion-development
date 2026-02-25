<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/provincias/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_poblacion = $jsonobj2->cod_poblacion ?? null;
$nom_poblacion = $jsonobj2->nom_poblacion ?? null;
$cod_provincia = $jsonobj2->cod_provincia ?? null;

acabarRequest(obtenerPoblacionesParam(
    $cod_poblacion, 
    $nom_poblacion, 
    $cod_provincia,
));

