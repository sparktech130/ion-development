<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/infracciones/main.php";

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
}

$matricula = $jsonobj2->matricula ?? null;
$pais = $jsonobj2->pais ?? null;
$color = $jsonobj2->color ?? null;
$marca = $jsonobj2->marca ?? null;
$velocidad_vehiculo = $jsonobj2->velocidad_vehiculo ?? null;

$dispositivos = array();
if (isset($jsonobj2->dispositivos)) {
	foreach ($jsonobj2->dispositivos as $key => $value) {
		$dispositivos[$key] = $value;
	}
} else {
	$dispositivos = null;
}

$direccion = $jsonobj2->direccion ?? null;
$estat = $jsonobj2->estat ?? null;
$envio = $jsonobj2->envio ?? null;
$cod_infraccion = $jsonobj2->cod_infraccion ?? null;
$usuario = $jsonobj2->usuario ?? null;
$tipo = $jsonobj2->tipo ?? null;
$tipo_vh = $jsonobj2->tipo_vh ?? null;
$alertas = $jsonobj2->alertas ?? null;
$cod_provincia = $jsonobj2->cod_provincia ?? null;
$modelo = $jsonobj2->modelo ?? null;
$cod_poblacion = $jsonobj2->cod_poblacion ?? null;
$modelo = $jsonobj2->modelo ?? null;
$modulos = $jsonobj2->modulos ?? null;
$confidence = $jsonobj2->confidence ?? null;
$orientacion = $jsonobj2->orientacion ?? null;
$cod_lista = $jsonobj2->cod_lista ?? null;

$consultaModulos = false;

$campos = array();
foreach ($jsonobj2->campos as $key => $value) {
	$campos[$key] = $value;
}

$order = array();
if (isset($jsonobj2->order) && !empty($jsonobj2->order)) {
    foreach ($jsonobj2->order as $key => $value) {
        $order[$key] = $value;
    }
}

$infracciones = obtenerInfraccionesVehiculosGroupBy(
	fecha_ini: $fecha_ini,
	fecha_fin: $fecha_fin,
	hora_ini: $hora_ini,
	hora_fin: $hora_fin,
	matricula: $matricula,
	color: $color,
	marca: $marca,
	tipo: $tipo,
	tipo_vh: $tipo_vh,
	pais: $pais,
	dispositivos: $dispositivos,
	velocidad_vehiculo: $velocidad_vehiculo,
	campos: $campos,
	order: $order,
	direccion: $direccion,
	estat: $estat,
	envio: $envio,
	cod_infraccion: $cod_infraccion,
	usuario: $usuario,
	cod_provincia: $cod_provincia,
	modelo: $modelo,
	cod_poblacion: $cod_poblacion,
	modulos: $modulos,
	confidence: $confidence,
	orientacion: $orientacion,
	cod_lista: $cod_lista,
	alertas: $alertas,
	h24: $es24 ?? false
);

acabarRequest($infracciones);

