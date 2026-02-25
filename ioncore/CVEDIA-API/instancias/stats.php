<?php
// TODO: Hacer que funcione en el servidor apache
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Instancia;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;

if (!$instanceId) {
    acabarRequest([
        "message" => "No se ha podido obtener la instancia",
        "error" => true,
    ]);
}

$instancia = obtenerDispositivosCloudAnalysis(instanceId: $instanceId);
if (!(
    $instancia &&
    is_array($instancia) &&
    !isset($instancia["error"]) &&
    count($instancia) === 1
)) {
    acabarRequest([
        "message" => "Instancia inválida o no encontrada",
        "instancia" => $instancia,
        "error" => true,
    ]);
}
$instancia = $instancia[0];

$cod_cloud_analysis = $instancia->cod_cloud_analysis;
$analysis_url = Utils::obtenerServer($instancia->ip, $instancia->puerto);

$instanceClass = new Instancia($analysis_url);
set_time_limit(0);

header("Content-Type: text/event-stream");

$start = time();
$deadline = $start + 30; // 30 segundos de máximo
$maxConsecutiveFails = 5;
$fails = 0;

echo json_encode(['status' => 'starting', 'ts' => gmdate('c')], JSON_UNESCAPED_UNICODE) . "\n";
flush();

while (true) {
    if (connection_aborted()) {
        // Cliente cerró conexión: corta para liberar el worker
        break;
    }
    if (time() >= $deadline) {
        echo json_encode(['status' => 'timeout', 'ts' => gmdate('c')], JSON_UNESCAPED_UNICODE) . "\n";
        flush();
        break;
    }

    try {
        $out = $instanceClass->instance_stats(instanceId: $instanceId);

        // Si tu backend puede devolver objetos, normaliza a array
        if (is_object($out)) {
            $out = (array)$out;
        }

        // Señal de parada desde el backend
        if (isset($out['isRunning']) && $out['isRunning'] === false) {
            echo json_encode($out, JSON_UNESCAPED_UNICODE) . "\n";
            break;
        }

        echo json_encode($out, JSON_UNESCAPED_UNICODE) . "\n";
        ob_flush();
        flush();

        $fails = 0; // reset
    } catch (\Throwable $e) {
        $fails++;
        echo json_encode([
            'error' => true,
            'message' => 'fetch_failed',
            'attempt' => $fails,
            'ts' => gmdate('c'),
        ], JSON_UNESCAPED_UNICODE) . "\n";
        ob_flush();
        flush();
        if ($fails >= $maxConsecutiveFails) {
            break;
        }
    }

    // Pequeña pausa para no saturar
    usleep(1000000); // 1s
}
