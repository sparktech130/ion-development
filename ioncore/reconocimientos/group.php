<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/reconocimientos/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$fecha_ini = null;
$fecha_fin = null;
if (isset($jsonobj2->fecha_ini) && isset($jsonobj2->fecha_fin)) {
    $fecha_ini = $jsonobj2->fecha_ini;
    $fecha_fin = $jsonobj2->fecha_fin;
}

$hora_ini = null;
$hora_fin = null;
if (isset($jsonobj2->hora_ini) && isset($jsonobj2->hora_fin)) {
    $hora_ini = $jsonobj2->hora_ini;
    $hora_fin = $jsonobj2->hora_fin;

    $hora_ini_format = date('H:i', strtotime($hora_ini));
    $hora_fin_format  = date('H:i', strtotime($hora_fin));

    $hora_ini = $hora_ini_format;
    $hora_fin = $hora_fin_format;
}

$matricula = $jsonobj2->matricula ?? null;
$color = $jsonobj2->color ?? null;
$marca = $jsonobj2->marca ?? null;
$modelo = $jsonobj2->modelo ?? null;
$tipo_vh = $jsonobj2->tipo_vh ?? null;
$cod_provincia = $jsonobj2->cod_provincia ?? null;
$pais = $jsonobj2->pais ?? null;
$cod_poblacion = $jsonobj2->cod_poblacion ?? null;
$velocidad_vehiculo = $jsonobj2->velocidad_vehiculo ?? null;

$campos = array();
foreach ($jsonobj2->campos as $key => $value) {
    $campos[$key] = $value;
}

$dispositivos = array();
if (isset($jsonobj2->dispositivos)) {
    foreach ($jsonobj2->dispositivos as $value) {
        $dispositivos[] = $value;
    }
}

$order = array();
if (isset($jsonobj2->order)) {
    foreach ($jsonobj2->order as $key => $value) {
        $order[$key] = $value;
    }
}

$modulos = $jsonobj2->modulos ?? null;
$confidence = $jsonobj2->confidence ?? null;
$orientacion = $jsonobj2->orientacion ?? null;
$cod_lista = $jsonobj2->cod_lista ?? null;
$cod_campaign = $jsonobj2->cod_campaign ?? null;

$cod_area = $jsonobj2->cod_area ?? null;
$tipo_area = $jsonobj2->tipo_area ?? null;

$alertas = array();
if (isset($jsonobj2->alertas)) {
    foreach ($jsonobj2->alertas as $valor) {
        $alertas[] = $valor;
    }
}

$rows = obtenerReconocimientosGroupBy(
    fecha_ini: $fecha_ini,
    fecha_fin: $fecha_fin,
    hora_ini: $hora_ini,
    hora_fin: $hora_fin,
    matricula: $matricula,
    color: $color,
    marca: $marca,
    tipo_vh: $tipo_vh,
    pais: $pais,
    dispositivos: $dispositivos,
    velocidad_vehiculo: $velocidad_vehiculo,
    campos: $campos,
    order: $order,
    cod_provincia: $cod_provincia,
    modelo: $modelo,
    cod_poblacion: $cod_poblacion,
    modulos: $modulos,
    confidence: $confidence,
    orientacion: $orientacion,
    cod_lista: $cod_lista,
    cod_area: $cod_area,
    tipo_area: $tipo_area,
    alertas: $alertas,
    cod_campaign: $cod_campaign,
    h24: $es24 ?? false
);

acabarRequest($rows);
