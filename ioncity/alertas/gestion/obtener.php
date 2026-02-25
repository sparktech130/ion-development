<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/alertas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_alertagest = $jsonobj2->cod_alertagest ?? null;
$nombre_alerta = $jsonobj2->nombre_alerta ?? null;
$cod_modulo = $jsonobj2->cod_modulo ?? null;

$tipos = null;
if (isset($jsonobj2->tipo_alerta)) {
	$tipos = explode(";", $jsonobj2->tipo_alerta); //array
	foreach ($tipos as $tipo_alerta => $value) {
		$tipos[$tipo_alerta] = $value;
	}
}

$rows = obtenerAlertasGestionParam(
    cod_alertagest: $cod_alertagest, 
    nombre_alerta: $nombre_alerta, 
    tipos_alertas: $tipos,
    cod_modulo: $cod_modulo,
);

acabarRequest($rows);
