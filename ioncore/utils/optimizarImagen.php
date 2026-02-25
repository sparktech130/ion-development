<?php		
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/consts.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/utils/main.php";

//RECOGEMOS LO QUE LLEGA POR POST:
$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$ruta_original = $jsonobj2->ruta_original ?? null;
$ruta_guardar = $jsonobj2->ruta_guardar ?? null;

// calidad jpg: escala de 0 100
// calidad png: escala de 0 a 9
$calidad = $jsonobj2->calidad ?? 20;

acabarRequest(optimizarImagen(
    $ruta_original, 
    $ruta_guardar, 
    $calidad,
));
?>

