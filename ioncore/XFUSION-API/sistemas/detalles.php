<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/sistemas/main.php";

header('Content-Type: application/json');
$inputJson = file_get_contents('php://input');
$req = json_decode($inputJson ?: '[]');

$id = $req->id ?? null;

try {
    // 1) Login
    require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/login.php";

    // 2) Sistemas detallados (GET a cada @odata.id)
    $sistemas = fd_listar_sistemas_con_token(
        id: $id,
        detailed: true,
    );
    $out = array(
        'generated_at' => date('c'),
        'sistemas'        => $sistemas,
    );
    acabarRequest($out);
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
        [$m, $raw] = explode("JSON", $msg);
        echo json_encode(array('error' => $m, 'raw_error' => json_decode($raw)), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }
}

