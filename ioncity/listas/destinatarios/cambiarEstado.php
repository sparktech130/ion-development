<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$id = $jsonobj2->id ?? null;
$activo = $jsonobj2->activo ?? null;

// Validar campos requeridos
if (!$id) {
    acabarRequest([
        "error" => true,
        "message" => "Campo requerido: id"
    ], 400);
}

if ($activo === null) {
    acabarRequest([
        "error" => true,
        "message" => "Campo requerido: activo"
    ], 400);
}

// Convertir a int
$activo = $activo ? 1 : 0;

$resultado = cambiarEstadoDestinatario(
    id: $id,
    activo: $activo,
);

if ($resultado && !isset($resultado['error'])) {
    acabarRequest([
        "success" => true,
        "message" => $activo ? "Destinatario activado correctamente" : "Destinatario desactivado correctamente"
    ]);
} else {
    acabarRequest($resultado);
}

