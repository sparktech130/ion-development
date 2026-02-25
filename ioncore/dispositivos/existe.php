<?php
$_SESSION["AUTHED"] = false;
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$deviceId = $jsonobj2->deviceId ?? null;
if (!$deviceId || $deviceId == "") {
    acabarRequest(["message" => "deviceId inválido", "error" => true], 400);
}
$dispositivo = obtenerDispositivos(
    deviceId: $deviceId,
);

if (isset($dispositivo["error"]) && $dispositivo["error"] == true) {
    acabarRequest($dispositivo, 500);
}

acabarRequest([
    "existe" => count($dispositivo) > 0
]);
