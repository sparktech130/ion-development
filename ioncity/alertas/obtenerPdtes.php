<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/alertas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_alerta = $jsonobj2->cod_alerta ?? null;

if (isset($jsonobj2->fecha_ini) && isset($jsonobj2->fecha_fin)) {
	$fecha_ini = $jsonobj2->fecha_ini;
	$fecha_fin = $jsonobj2->fecha_fin;
} else {
	$fecha_ini = null;
	$fecha_fin = null;
}

if (isset($jsonobj2->hora_ini) && isset($jsonobj2->hora_fin)) {
	$hora_ini = $jsonobj2->hora_ini;
	$hora_fin = $jsonobj2->hora_fin;
} else {
	$hora_ini = null;
	$hora_fin = null;
}

$matricula = $jsonobj2->matricula ?? null;
$pais = $jsonobj2->pais ?? null;
$marca = $jsonobj2->marca ?? null;
$modelo = $jsonobj2->modelo ?? null;
$color = $jsonobj2->color ?? null;
$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$nom_dispositivo = $jsonobj2->nom_dispositivo ?? null;
$orientacion = $jsonobj2->orientacion ?? null;
$confidence = $jsonobj2->confidence ?? null;
$tipo_vh = $jsonobj2->tipo_vh ?? null;
$nombre_lista = $jsonobj2->nombre_lista ?? null;
$velocidad = $jsonobj2->velocidad ?? null;

$alertas = array();
if (isset($jsonobj2->alertas)) {
	foreach ($jsonobj2->alertas as $valor) {
		$alertas[] = $valor;
	}
}

$limit = $jsonobj2->limit ?? null;
$modulos = $jsonobj2->modulos ?? null;

$tipo_vh = $jsonobj2->tipo_vh ?? null;
$velocidad_vehiculo = $jsonobj2->velocidad_vehiculo ?? null;
$nombre_lista = $jsonobj2->nombre_lista ?? null;

$cod_area = $jsonobj2->cod_area ?? null;

$alertas = obtenerAlertasPdtes(
	cod_alerta: $cod_alerta,
	fecha_ini: $fecha_ini,
	fecha_fin: $fecha_fin,
	hora_ini: $hora_ini,
	hora_fin: $hora_fin,
	matricula: $matricula,
	pais: $pais,
	marca: $marca,
	modelo: $modelo,
	color: $color,
	cod_dispositivo: $cod_dispositivo,
	nom_dispositivo: $nom_dispositivo,
	orientacion: $orientacion,
	confidence: $confidence,
	alertas: $alertas,
	limit: $limit,
	modulos: $modulos,
	tipo_vh: $tipo_vh,
	velocidad_vehiculo: $velocidad_vehiculo,
	nombre_lista: $nombre_lista,
    cod_area: $cod_area,
    h24: $es24 ?? false,
);
acabarRequest($alertas);

