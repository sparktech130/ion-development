<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/reconocimientos/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$nom_dispositivo = $jsonobj2->nom_dispositivo ?? null;
$cod_alertagest = $jsonobj2->cod_alertagest ?? null;
$nombre_lista = $jsonobj2->nombre_lista ?? null;
$modulos = $jsonobj2->modulos ?? null;

acabarRequest(obtenerReconocimientosAlertas24(
    cod_dispositivo: $cod_dispositivo,
	nom_dispositivo: $nom_dispositivo,
	cod_alertagest: $cod_alertagest,
	nombre_lista: $nombre_lista,
	modulos: $modulos,
));

