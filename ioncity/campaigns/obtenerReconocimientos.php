<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/campaigns/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$matricula = $jsonobj2->matricula ?? null;
$color = $jsonobj2->color ?? null;
$marca = $jsonobj2->marca ?? null;
$modelo = $jsonobj2->modelo ?? null;

$fecha_fin = null;
$fecha_ini = null;
if (isset($jsonobj2->fecha_ini) && isset($jsonobj2->fecha_fin)) {
    $fecha_ini = $jsonobj2->fecha_ini;
    $fecha_fin = $jsonobj2->fecha_fin;
}

$hora_ini = null;
$hora_fin = null;
if (isset($jsonobj2->hora_ini) && isset($jsonobj2->hora_fin)) {
    $hora_ini = $jsonobj2->hora_ini;
    $hora_fin = $jsonobj2->hora_fin;
}

$datetime_inicial = $jsonobj2->datetime_inicial ?? null;
$datetime_final = $jsonobj2->datetime_final ?? null;

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$nom_dispositivo = $jsonobj2->nom_dispositivo ?? null;

$cod_reconoc = $jsonobj2->cod_reconoc ?? null;

$cod_alerta_gest = $jsonobj2->cod_alerta_gest ?? null;
$nombre_alerta = $jsonobj2->nombre_alerta ?? null;

$pais = $jsonobj2->pais ?? null;
$confidence = $jsonobj2->confidence ?? null;
$orientacion = $jsonobj2->orientacion ?? null;
$order = $jsonobj2->order ?? null;

$modulos = $jsonobj2->modulos ?? null;
$tipo_vh = $jsonobj2->tipo_vh ?? null;
$velocidad_vehiculo = $jsonobj2->velocidad_vehiculo ?? null;
$nombre_lista = $jsonobj2->nombre_lista ?? null;

$limit = $jsonobj2->limit ?? null;
$page = $jsonobj2->page ?? null;

$ultimo_cod_reconoc = $jsonobj2->ultimo_cod_reconoc ?? null;
$cod_campaign = $jsonobj2->cod_campaign ?? null;

$rows = obtenerReconocimientosCampaign(
    cod_reconoc: $cod_reconoc,
    matricula: $matricula,
    color: $color,
    marca: $marca,
    modelo: $modelo,
    fecha_ini: $fecha_ini,
    fecha_fin: $fecha_fin,
    hora_ini: $hora_ini,
    hora_fin: $hora_fin,
    datetime_inicial: $datetime_inicial,
    datetime_final: $datetime_final,
    cod_dispositivo: $cod_dispositivo,
    cod_alerta_gest: $cod_alerta_gest,
    nombre_alerta: $nombre_alerta,
    pais: $pais,
    confidence: $confidence,
    orientacion: $orientacion,
    order: $order,
    modulos: $modulos,
    nom_dispositivo: $nom_dispositivo,
    tipo_vh: $tipo_vh,
    velocidad_vehiculo: $velocidad_vehiculo,
    nombre_lista: $nombre_lista,
    limit: $limit,
    page: $page,
    ultimo_cod_reconoc: $ultimo_cod_reconoc,
    cod_campaign: $cod_campaign
);

$total = obtenerReconocimientosCampaignCount($cod_campaign);

acabarRequest([
    "total" => $total,
    "rows" => $rows
]);

