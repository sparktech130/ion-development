<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_usuario = $jsonobj2->cod_usuario ?? null;
$logs = $jsonobj2->logs ?? null;

if (!is_array($logs)) {
    acabarRequest($logs);
}

$returnObj = [];
foreach ($logs as $key => $log) {
    $cod_accion = $log->cod_accion ?? null;
    $modulo = $log->modulo ?? null;
    $seccion = $log->seccion ?? null;
    $datetime = $log->date ?? null;
    $extra_data = $log->extra_data ?? null;

    $insert = insertLogUsuario($cod_usuario, $cod_accion, $modulo, $seccion, $datetime, $extra_data);

    $returnObj[] = [$cod_accion => $insert];
}
acabarRequest($returnObj);
