<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/alertas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonDecode = json_decode($jsonobj);

$cod_reconoc = $jsonDecode->cod_reconoc ?? null;
$matricula = $jsonDecode->matricula ?? null;
$cod_alertagest = $jsonDecode->cod_alertagest ?? null;
$incidencia = $jsonDecode->incidencia ?? null;
$cod_dispositivo = $jsonDecode->cod_dispositivo ?? null;
$fecha = $jsonDecode->fecha ?? null;
$hora = $jsonDecode->hora ?? null;
$estat = $jsonDecode->estat ?? null;
$usuario = $jsonDecode->usuario ?? null;
$f_modif = $jsonDecode->f_modif ?? null;
$cod_alertagest = $jsonDecode->cod_alertagest ?? null;

$result = insertarAlerta(
    cod_reconoc: $cod_reconoc,
    matricula: $matricula,
    incidencia: $incidencia,
    cod_dispositivo: $cod_dispositivo,
    fecha: $fecha,
    hora: $hora,
    estat: $estat,
    usuario: $usuario,
    f_modif: $f_modif,
    cod_alertagest: $cod_alertagest
);

if ($result == false) {
    acabarRequest($result, 500);
}

modificarAlertaReconocimiento($cod_reconoc, $cod_alertagest);
enviarAlertaSocket($result);

acabarRequest($result);

