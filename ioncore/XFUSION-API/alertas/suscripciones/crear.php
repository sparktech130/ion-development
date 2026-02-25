<?php
$_SESSION["AUTHED"] = false;

require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/alertas/main.php";

header('Content-Type: application/json');

if (session_status() !== PHP_SESSION_ACTIVE) { session_start(); }
if (!isset($_SESSION["FD"]) || !is_object($_SESSION["FD"])) {
    $_SESSION["FD"] = (object) array(
        'host'=>null,'user'=>null,'password'=>null,'verify'=>true,'apiV'=>'0.9','token'=>null,'loc'=>null
    );
}

/** Sacamos las credenciales y datos del host del fichero alrt.env */
/** En caso de las variables booleanas, utilizamos la función auxiliar `boolEnv()` */

/** ====== DESTINO WEBHOOK ====== */
$protocol = boolEnv("WEBHOOK_HTTPS") === true ? "https":"http";
$destino = "{$protocol}://{$_ENV["WEBHOOK_HOST"]}/core/XFUSION-API/alertas/recepcion.php";
$contexto = 'Alertas FusionDirector';

/** ====== CREDENCIALES PARA OEM/Basic Auth ====== */

$destUser = $_ENV["EXPECTED_USER"];
$destPass = $_ENV["EXPECTED_PASS"];
$verifyCertBool = boolEnv("WEBHOOK_VERIFY_SSL"); // HTTP

/** ====== TOKEN requerido por FusionDirector en HttpHeaders ====== */
$eventTokenHeader = $_ENV["EXPECTED_EVENT_TOKEN"];

try {
    /** ====== CONFIGURACION FusionDirector + Login  ====== */
    require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/login.php";

    $existente = null;
    try {
        $existente = fa_buscar_suscripcion_por_destino($destino);
    } catch (Throwable $ign) {}

    if (is_array($existente)) {
        echo json_encode(array(
            'ok' => true,
            'nota' => 'Suscripción ya existente',
            'destino' => $destino,
            'suscripcion' => $existente
        ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }

    $creada = fd_crear_suscripcion_eventos_alert_with_oem_auth(
        $destino,
        $contexto,
        $destUser,
        $destPass,
        $verifyCertBool,
        $eventTokenHeader  
    );

    echo json_encode(array(
        'ok'      => true,
        'destino' => $destino,
        'creada'  => $creada
    ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (Throwable $e) {
    http_response_code(500);
    $err = $e->getMessage();
    [$err, $raw_err] = explode("JSON", $err);
    echo json_encode(array(
        'ok'    => false,
        'error' => $err,
        'raw_error' => json_decode($raw_err),
    ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
