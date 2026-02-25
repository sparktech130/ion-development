<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/main.php";

header('Content-Type: application/json');

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$id = $jsonobj2->id ?? null;

try {
    // 1) Login
    require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/login.php";

    // 2) Nodos detallados (GET a cada @odata.id)
    $nodos = fd_listar_nodos_detalle_con_token($id);
    foreach ($nodos as $key => $n) {
        if (!$n["id"]) continue;

        $nodos[$key]["resume"] = fd_resumen_nodo($n["id"]);
    }

    // 3) Salud y predicciones globales
    $resumen = fd_resumen_salud($nodos);

    $out = array(
        'generated_at' => date('c'),
        'summary'      => $resumen,
        'nodes'        => $nodos,
    );
    echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    $msg = $e->getMessage();
    if (strpos($msg, 'CreateLimitReachedForResource') !== false) {
        http_response_code(429);
        echo json_encode(array(
            'error'   => 'Límite de sesiones alcanzado en FusionDirector',
            'code'    => 'Base.1.0.CreateLimitReachedForResource',
            'message' => 'Cierra sesiones en la GUI de FD o espera el timeout antes de reintentar.',
            'hint'    => 'Asegúrate de cerrar siempre la sesión (bloque finally).',
            'exception_message' => $msg,
        ), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    } else {
        http_response_code(500);
        echo json_encode(array('error' => $msg), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }
}
