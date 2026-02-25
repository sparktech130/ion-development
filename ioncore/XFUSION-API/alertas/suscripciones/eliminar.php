<?php
$_SESSION["AUTHED"] = false;

require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/alertas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

if (!isset($jsonobj2->id)) {
    acabarRequest([
        "message" => "Filtro necesario: 'id'",
        "error" => true,
    ]);
}

$id = $jsonobj2->id;

try {
    acabarRequest(fa_eliminar_suscripcion_eventos($id));
} catch (Throwable $e) {
    acabarRequest([
        'ok'    => false,
        'error' => $e->getMessage()
    ], 500);
}
