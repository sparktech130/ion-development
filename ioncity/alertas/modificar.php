<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/alertas/main.php";
$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_alerta = $jsonobj2->cod_alerta ?? null;
$cod_reconoc = $jsonobj2->cod_reconoc ?? null;
$matricula = $jsonobj2->matricula ?? null;
$incidencia = $jsonobj2->incidencia ?? null;
$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$fecha = $jsonobj2->fecha ?? null;
$hora = $jsonobj2->hora ?? null;
$estat = $jsonobj2->estat ?? null;
$usuario = $jsonobj2->usuario ?? null;
$motivo = $jsonobj2->motivo ?? null;

$tipo_vh = $jsonobj2->tipo_vh ?? null;
$marca = $jsonobj2->marca ?? null;
$modelo = $jsonobj2->modelo ?? null;
$color = $jsonobj2->color ?? null;
$pais = $jsonobj2->pais ?? null;

$datos_alerta = obtenerAlertas($cod_alerta);

if (empty($datos_alerta)) {
    acabarRequest(false);
}

if (!isset($cod_reconoc)) {
    $cod_reconoc = $datos_alerta[0]->cod_reconoc;

    modificarReconocimientos(
        cod_reconoc: $cod_reconoc,
        matricula: $matricula, 
        tipo_vh: $tipo_vh, 
        marca: $marca, 
        modelo: $modelo, 
        color: $color, 
        pais: $pais,
    );
}

$update = modificarAlertas(
    cod_alerta: $cod_alerta, 
    cod_reconoc: $cod_reconoc, 
    matricula: $matricula, 
    incidencia: $incidencia, 
    cod_dispositivo: $cod_dispositivo, 
    fecha: $fecha, 
    hora: $hora, 
    estat: $estat, 
    usuario: $usuario, 
    motivo: $motivo,
);
acabarRequest($update);

