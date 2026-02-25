<?php
$_SESSION["AUTHED"] = false;

require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/alertas/main.php";

try {
    /** ====== CONFIGURACION FusionDirector + Login  ====== */
    require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/login.php";

    $sus = fa_listar_suscripciones_eventos();
    acabarRequest($sus);
} catch (Throwable $e) {
    http_response_code(500);
    $err = $e->getMessage();
    [$err, $raw_err] = explode("JSON", $err);
    echo json_encode(array(
        'ok'    => false,
        'error' => $err,
        'raw_error' => $raw_err,
    ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
