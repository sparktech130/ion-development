<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/alertas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$campos = array();
foreach ($jsonobj2->campos as $key => $value) {
	$campos[$key] = $value;
}

$order = array();
if (isset($jsonobj2->order)) {
	foreach ($jsonobj2->order as $key => $value) {
		$order[$key] = $value;
	}
}

$fecha_ini = $jsonobj2->fecha_ini ?? null;
$fecha_fin = $jsonobj2->fecha_fin ?? null;

$estat = $jsonobj2->estat ?? null;

$incidencia = $jsonobj2->incidencia ?? null;

$limit = $jsonobj2->limit ?? null;

$modulos = $jsonobj2->modulos ?? null;

$dispositivos = array();
if (isset($jsonobj2->dispositivos)) {
    foreach ($jsonobj2->dispositivos as $value) {
        $dispositivos[] = $value;
    }
}

acabarRequest(obtenerAlertasGroupBy(
	campos: $campos,
	incidencia: $incidencia,
	fecha_ini: $fecha_ini,
	fecha_fin: $fecha_fin,
	estat: $estat,
	limit: $limit,
	modulos: $modulos,
    dispositivos: $dispositivos,
	order: $order,
	h24: $es24 ?? false
));

