<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/campaigns/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$nombre_campaign = $jsonobj2->nombre_campaign ?? null;
$fecha_ini = $jsonobj2->fecha_ini ?? null;
$fecha_fin = $jsonobj2->fecha_fin ?? null;
$cod_tipo_camp = $jsonobj2->cod_tipo_camp ?? null;
$cod_usuario = $cod_usuario_token;
$coordenadas = $jsonobj2->coordenadas ?? null;

$insert = insertarCampaign(
    nombre_campaign: $nombre_campaign,
    fecha_ini: $fecha_ini,
    fecha_fin: $fecha_fin,
    cod_tipo_camp: $cod_tipo_camp,
    cod_usuario: $cod_usuario,
    coordenadas: $coordenadas
);

acabarRequest($insert);

