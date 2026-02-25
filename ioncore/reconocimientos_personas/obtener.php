<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/reconocimientos_personas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$refTrackingId = $jsonobj2->refTrackingId ?? null;
$fecha_ini = $jsonobj2->fecha_ini ?? null;
$fecha_fin = $jsonobj2->fecha_fin ?? null;
$hora_ini = $jsonobj2->hora_ini ?? null;
$hora_fin = $jsonobj2->hora_fin ?? null;
$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;

$genero = $jsonobj2->genero ?? null;
$asistido = $jsonobj2->asistido ?? null;
$cara_tapada = $jsonobj2->cara_tapada ?? null;
$ropa_superior = $jsonobj2->ropa_superior ?? null;
$ropa_inferior = $jsonobj2->ropa_inferior ?? null;
$telefono = $jsonobj2->telefono ?? null;
$gafas = $jsonobj2->gafas ?? null;
$edad = $jsonobj2->edad ?? null;
$tatuado = $jsonobj2->tatuado ?? null;
$carga_bolsa = $jsonobj2->carga_bolsa ?? null;
$fumando = $jsonobj2->fumando ?? null;

$marcado = $jsonobj2->marcado ?? false;

$limit = $jsonobj2->limit ?? 200;

$recons = obtenerReconocimientosPersonas(
    refTrackingId: $refTrackingId,
    fecha_ini: $fecha_ini,
    fecha_fin: $fecha_fin,
    hora_ini: $hora_ini,
    hora_fin: $hora_fin,
    cod_dispositivo: $cod_dispositivo,
    genero: $genero,
    asistido: $asistido,
    cara_tapada: $cara_tapada,
    ropa_superior: $ropa_superior,
    ropa_inferior: $ropa_inferior,
    telefono: $telefono,
    gafas: $gafas,
    edad: $edad,
    tatuado: $tatuado,
    carga_bolsa: $carga_bolsa,
    fumando: $fumando,
    marcado: $marcado,
    limit: $limit,
);
$total = obtenerReconocimientosPersonasCount();
$returnObj = [
    "total" => $total,
    "rows" => $recons,
];
acabarRequest($returnObj);
