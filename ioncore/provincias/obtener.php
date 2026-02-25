<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/provincias/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_provincia = $jsonobj2->cod_provincia ?? null;
$nom_provincia = $jsonobj2->nom_provincia ?? null;

acabarRequest(obtenerProvinciasParam(
    cod_provincia: $cod_provincia, 
    nom_provincia: $nom_provincia,
));

