<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/campaigns/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_campaign = $jsonobj2->cod_campaign ?? null;
$nombre_campaign = $jsonobj2->nombre_campaign ?? null;
$fecha_fin = $jsonobj2->fecha_fin ?? null;
$cod_tipo_camp = $jsonobj2->cod_tipo_camp ?? null;
$coordenadas = $jsonobj2->coordenadas ?? null;

$update = modificarCampaign(
    cod_campaign: $cod_campaign,
    nombre_campaign: $nombre_campaign,
    fecha_fin: $fecha_fin,
    cod_tipo_camp: $cod_tipo_camp,
    coordenadas: $coordenadas
);

acabarRequest($update);

