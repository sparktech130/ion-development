<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;

$dispositivo = obtenerDispositivos($cod_dispositivo);

if (!(
    !empty($dispositivo) &&
        !isset($dispositivo["error"]) &&
        count($dispositivo) == 1)
) {
    acabarRequest(false);
}

if (isset($dispositivo[0]->id_regla_evento) && strlen($dispositivo[0]->id_regla_evento) == 36){
    acabarRequest(["message" => "El dispositivo ya tiene un evento creado", "error" => true]);
} 

acabarRequest(crearEventoMovimientoDispositivoNx($cod_dispositivo));
