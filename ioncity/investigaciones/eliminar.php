<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/investigaciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_investigacion = $jsonobj2->cod_investigacion ?? null;

$delete = eliminarInvestigacion(
    cod_investigacion: $cod_investigacion,
);
acabarRequest($delete);

