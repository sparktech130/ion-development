<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$id = $jsonobj2->id ?? null;
$canal = $jsonobj2->canal ?? null;
$destinatario = $jsonobj2->destinatario ?? null;
$nombre = $jsonobj2->nombre ?? null;
$activo = $jsonobj2->activo ?? null;

// Validar ID requerido
if (!$id) {
    acabarRequest([
        "error" => true,
        "message" => "Campo requerido: id"
    ], 400);
}

// Validar canal si se proporciona
if ($canal && !in_array($canal, ['email', 'sms', 'whatsapp'])) {
    acabarRequest([
        "error" => true,
        "message" => "Canal inválido. Debe ser: email, sms o whatsapp"
    ], 400);
}

// Convertir activo de boolean a int si se proporciona
if ($activo !== null) {
    $activo = $activo ? 1 : 0;
}

$update = modificarDestinatarioLista(
    id: $id,
    canal: $canal,
    destinatario: $destinatario,
    nombre: $nombre,
    activo: $activo,
);

acabarRequest($update);
