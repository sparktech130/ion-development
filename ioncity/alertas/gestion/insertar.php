<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/alertas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$nombre_alerta = $jsonobj2->nombre_alerta ?? null;
$desc_alerta = $jsonobj2->desc_alerta ?? null;
$tipo_alerta = $jsonobj2->tipo_alerta ?? null;

$destinatarios_mail = $jsonobj2->destinatarios_mail ?? null;
$destinatarios_sms = $jsonobj2->destinatarios_sms ?? null;
$destinatarios_llamada = $jsonobj2->destinatarios_llamada ?? null;

$cod_provincia = $jsonobj2->cod_provincia ?? null;
$cod_poblacion = $jsonobj2->cod_poblacion ?? null;

$cod_modulo = $jsonobj2->cod_modulo ?? null;

$insert = insertarAlertaGestion(
    nombre_alerta: $nombre_alerta, 
    desc_alerta: $desc_alerta, 
    tipo_alerta: $tipo_alerta, 
    destinatarios_mail: $destinatarios_mail, 
    destinatarios_sms: $destinatarios_sms, 
    destinatarios_llamada: $destinatarios_llamada, 
    cod_provincia: $cod_provincia, 
    cod_poblacion: $cod_poblacion,
    cod_modulo: $cod_modulo,
);

acabarRequest($insert);
