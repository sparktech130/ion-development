<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/campaigns/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_campaign = $jsonobj2->cod_campaign ?? null;
$nombre_campaign = $jsonobj2->nombre_campaign ?? null;
$fecha_ini = $jsonobj2->fecha_ini ?? null;
$fecha_fin = $jsonobj2->fecha_fin ?? null;
$estado_campaign = $jsonobj2->estado_campaign ?? null;
$cod_tipo_camp = $jsonobj2->cod_tipo_camp ?? null;
$limit = $jsonobj2->limit ?? null;

$rows = obtenerCampaignsParam(
    cod_campaign: $cod_campaign,
    nombre_campaign: $nombre_campaign,
    fecha_ini: $fecha_ini,
    fecha_fin: $fecha_fin,
    estado_campaign: $estado_campaign,
    cod_tipo_camp: $cod_tipo_camp,
    limit: $limit
);
$total = obtenerCampaignsCount();

acabarRequest([
    "total" => $total,
    "rows" => $rows
]);

