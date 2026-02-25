<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$id = $jsonobj2->id ?? null;
$cod_lista = $jsonobj2->cod_lista ?? null;
$destinatario = $jsonobj2->destinatario ?? null;
$nombre = $jsonobj2->nombre ?? null;
$canal = $jsonobj2->canal ?? null;
$soloActivos = $jsonobj2->soloActivos ?? false;

// Validar canal si se proporciona
if ($canal && !in_array($canal, ['email', 'sms', 'whatsapp'])) {
    acabarRequest([
        "error" => true,
        "message" => "Canal inválido. Debe ser: email, sms o whatsapp"
    ], 400);
}

$resultado = obtenerDestinatariosLista(
    cod_lista: $cod_lista,
    id: $id,
    destinatario: $destinatario,
    nombre: $nombre,
    canal: $canal,
    soloActivos: $soloActivos,
);

acabarRequest($resultado);
