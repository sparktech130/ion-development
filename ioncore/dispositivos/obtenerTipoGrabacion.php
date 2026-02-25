<?php
include_once $_SERVER['DOCUMENT_ROOT'] . "/core/dispositivos/main.php";

use Funciones\Devices;

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$pos = $jsonobj2->pos ?? null;
$durationMs = $jsonobj2->durationMs ?? null;

$returnObj = [];
$dispositivo = [];
if ($cod_dispositivo)
    $dispositivo = obtenerDispositivosDatosCloud($cod_dispositivo);

if (!(
    !empty($dispositivo)
    && !isset($dispositivo["error"])
    && count($dispositivo) === 1
)) {
    acabarRequest($returnObj);
}

$disp = $dispositivo[0];


acabarRequest(["tipos" => Devices::obtenerTipoGrabacionMomento(
    $pos,
    $disp
)]);
