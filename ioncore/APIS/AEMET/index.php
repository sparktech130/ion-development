<?php

declare(strict_types=1);

$_SESSION['AUTHED'] = false;

// DEBUG (quítalo en producción)
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../aemet.php';


/* =======================
EJEMPLOS RÁPIDOS (TEST)
======================= */

// Predicción horaria por municipio (Inca 07027 / 08143 Odena )
/*
$jsonEntradaTest = json_encode([
    "accion" => "prediccion_municipio_horaria",
    "idMunicipio" => "07027"
], JSON_UNESCAPED_UNICODE);
*/

// Avisos CAP (España)
/*
$jsonEntradaTest = json_encode([
    "accion" => "avisos_cap",
    "area" => "esp",
    "include_xml" => false
], JSON_UNESCAPED_UNICODE);
*/

// Incendios (mapa riesgo PREVISTO, España, HOY)
// falla

$jsonEntradaTest = json_encode([
    "accion" => "incendios",
    "area" => "esp",
    "dia" => date('Y-m-d'),
    "producto" => "previsto"
], JSON_UNESCAPED_UNICODE);


// Rayos
/*
$jsonEntradaTest = json_encode([
    "accion" => "rayos",
    "embed_base64" => true
], JSON_UNESCAPED_UNICODE);
*/


// Redes especiales TODAS
/*$jsonEntradaTest = json_encode([
    "accion" => "redes_especiales",
    "tipo" => "radiacion",
    "modo" => "compact"
], JSON_UNESCAPED_UNICODE);
*/

// Redes especiales Filtrado por estacion:
/*
$jsonEntradaTest = json_encode([
    "accion" => "redes_especiales",
    "tipo" => "radiacion",
    "modo" => "compact",
    "estacion" => "8178D"
], JSON_UNESCAPED_UNICODE);
*/

/* =======================
ENTRADA: POST JSON o TEST
======================= */

$body = file_get_contents('php://input');
$entrada = (is_string($body) && trim($body) !== '') ? $body : $jsonEntradaTest;

$respuesta = api_router_from_json($entrada);

/**
 * Evita “pantalla en blanco” por UTF-8 raro en AEMET
 */
echo json_encode(
    $respuesta,
    JSON_UNESCAPED_UNICODE
        | JSON_PRETTY_PRINT
        | JSON_INVALID_UTF8_SUBSTITUTE
);
exit;
