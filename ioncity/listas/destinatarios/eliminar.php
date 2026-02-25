<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$id = $jsonobj2->id ?? null;
$cod_lista = $jsonobj2->cod_lista ?? null;

// Validar que al menos uno de los campos esté presente
if (!$id && !$cod_lista) {
    acabarRequest([
        "error" => true,
        "message" => "Debe proporcionar id o cod_lista"
    ], 400);
}

$delete = eliminarDestinatarioLista(
    id: $id,
    cod_lista: $cod_lista,
);

acabarRequest($delete);

