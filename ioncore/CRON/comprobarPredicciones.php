<?php
$_SESSION["AUTHED"] = false;

require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/funcionesXFusion.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/alertas/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/alertas/main.php";

header('Content-Type: application/json');

try {
    // 1) Login
    require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/login.php";

    // 2) Nodos detallados (GET a cada @odata.id)
    $nodos = fd_listar_nodos_detalle_con_token();

    // 3) Salud y predicciones globales
    $resumen = fd_resumen_salud($nodos);
} catch (Throwable $e) {
    $msg = $e->getMessage();
    if (strpos($msg, 'CreateLimitReachedForResource') !== false) {
        acabarRequest([
            'error'   => 'Límite de sesiones alcanzado en FusionDirector',
            'code'    => 'Base.1.0.CreateLimitReachedForResource',
            'message' => 'Cierra sesiones en la GUI de FD o espera el timeout antes de reintentar.',
            'hint'    => 'Asegúrate de cerrar siempre la sesión (bloque finally).',
            'exception_message' => $msg,
        ], 429);
    } else {
        acabarRequest(['error' => $msg], 500);
    }
}

if (count($nodos) <= 0) {
    acabarRequest([]);
}

$alertas = [];
$tipos = [
    "medium" => 1,
    "high" => 2,
];
foreach ($nodos as $n) {
    $pred = strtolower($n["Status"]["Prediction"]["prediction"]);

    if ($pred == "" || $pred === "stable") { continue; }

    $cod_tipo = function ($p) use ($tipos) {
        

    };

    $cod_alerta = insertarAlertaNodo(
        id: $n["id"],
        cod_tipo: $cod_tipo($pred),
    );
    $alertas[] = [
        "id" => $n["id"],
        "prediccion" => $pred,
        "cod_alerta" => $cod_alerta,
    ];
}

acabarRequest([
    "alertas" => $alertas,
]);
