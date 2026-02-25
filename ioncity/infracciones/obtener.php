<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/infracciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_infraccion = $jsonobj2->cod_infraccion ?? null;
$matricula = $jsonobj2->matricula ?? null;
$color = $jsonobj2->color ?? null;
$marca = $jsonobj2->marca ?? null;
$estat = $jsonobj2->estat ?? null;
$envio = $jsonobj2->envio ?? null;
$fecha_ini = $jsonobj2->fecha_ini ?? null;
$fecha_fin = $jsonobj2->fecha_fin ?? null;
$hora_ini = $jsonobj2->hora_ini ?? null;
$hora_fin = $jsonobj2->hora_fin ?? null;
$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$tipos = $jsonobj2->tipos ?? null;

$nom_dispositivo = $jsonobj2->nom_dispositivo ?? null;
$tipo_vh = $jsonobj2->tipo_vh ?? null;
$pais = $jsonobj2->pais ?? null;
$modelo = $jsonobj2->modelo ?? null;
$orientacion = $jsonobj2->orientacion ?? null;
$fiabilidad = $jsonobj2->fiabilidad ?? null;
$cod_lista = $jsonobj2->cod_lista ?? null;
$nombre_lista = $jsonobj2->nombre_lista ?? null;

$cod_area = $jsonobj2->cod_area ?? null;

acabarRequest(obtenerInfraccionesVehiculosParam(
    cod_infraccion: $cod_infraccion,
    matricula: $matricula,
    color: $color,
    marca: $marca,
    estat: $estat,
    envio: $envio,
    fecha_ini: $fecha_ini,
    fecha_fin: $fecha_fin,
    hora_ini: $hora_ini,
    hora_fin: $hora_fin,
    cod_dispositivo: $cod_dispositivo,
    tipos: $tipos,
    nom_dispositivo: $nom_dispositivo,
    tipo_vh: $tipo_vh,
    pais: $pais,
    modelo: $modelo,
    orientacion: $orientacion,
    confidence: $fiabilidad,
    cod_lista: $cod_lista,
    nombre_lista: $nombre_lista,
    cod_area: $cod_area
));

