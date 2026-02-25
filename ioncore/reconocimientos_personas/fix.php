<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/reconocimientos_personas/mainFix.php";
$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$fecha_ini = $jsonobj2->fecha_ini ?? null;
$fecha_fin = $jsonobj2->fecha_fin ?? null;

echo json_encode(procesarFotosReconocimientosPersonas(
    fecha_ini: $fecha_ini,
    fecha_fin: $fecha_fin,
));
