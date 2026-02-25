<?php
// === Config (tus valores) ===
$_SESSION["AUTHED"] = false;
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/alertas/main.php";

$expectedUser       = $_ENV["EXPECTED_USER"];
$expectedPass       = $_ENV["EXPECTED_PASS"];
$expectedEventToken = $_ENV["EXPECTED_EVENT_TOKEN"];

// === Log SIEMPRE en la MISMA carpeta que este archivo ===
$logFile = 'xfusion_alertas.log';

// === util mínima de escritura (y saber si falló) ===
$ts = date('c');
$wok = @file_put_contents($logFile, "[$ts] PING\n", FILE_APPEND | LOCK_EX);
$writeOk = ($wok !== false);
$writeErr = $writeOk ? null : error_get_last();

// Si ni siquiera pudo escribir, responde y sal (para que veas la ruta)
if (!$writeOk) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false,
        'logPath' => $logFile,
        'error' => 'No puedo escribir el log',
        'phpError' => $writeErr,
    ], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
    exit;
}

// --- desde aquí, ya sabemos que escribe bien ---
$remoteIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$method   = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
@file_put_contents($logFile, "[$ts] BEGIN $method from $remoteIp\n", FILE_APPEND | LOCK_EX);

// Headers + auth
$headers = function_exists('getallheaders') ? getallheaders() : [];
$authOk = false;

// Basic
$authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? null);
if ($authHeader && stripos($authHeader, 'Basic ') === 0) {
    $dec = base64_decode(substr($authHeader, 6), true);
    if ($dec !== false) {
        [$u,$p] = array_pad(explode(':',$dec,2),2,null);
        if ($u === $expectedUser && $p === $expectedPass) $authOk = true;
    }
}
// X-Auth-Token
if (!$authOk) {
    $x = $headers['X-Auth-Token'] ?? ($headers['x-auth-token'] ?? null);
    if ($x && hash_equals($expectedEventToken, $x)) $authOk = true;
}
@file_put_contents($logFile, "[$ts] AUTH ".($authOk?'OK':'FAIL')."\n", FILE_APPEND | LOCK_EX);

if (!$authOk) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['ok'=>false,'error'=>'Unauthorized','logPath'=>$logFile], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
    @file_put_contents($logFile, "[$ts] END 401\n", FILE_APPEND | LOCK_EX);
    exit;
}

// Cuerpo + descripción
$raw = file_get_contents('php://input');
@file_put_contents($logFile, "[$ts] BODY ".strlen($raw)." bytes\n", FILE_APPEND | LOCK_EX);

$decoded = json_decode($raw, true);
if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
    $ctx = $decoded['Context'] ?? null;
    if (!empty($decoded['Events']) && is_array($decoded['Events'])) {
        $i=1;
        foreach ($decoded['Events'] as $ev) {
            $etype = $ev['EventType'] ?? 'n/a';
            $sev   = $ev['Severity']  ?? 'n/a';
            $msg   = $ev['Message']   ?? ($ev['MessageId'] ?? 'n/a');
            $orig  = null;
            if (isset($ev['OriginOfCondition'])) {
                $orig = is_array($ev['OriginOfCondition']) ? ($ev['OriginOfCondition']['@odata.id'] ?? null) : (string)$ev['OriginOfCondition'];
            }
            $desc = "DESC#$i Type=$etype; Severity=$sev; Message=".(is_string($msg)?$msg:json_encode($msg));
            if ($orig) $desc .= "; Origin=$orig";
            if ($ctx)  $desc .= "; Context=$ctx";
            @file_put_contents($logFile, "[$ts] $desc\n", FILE_APPEND | LOCK_EX);
            $i++;
        }
    } else {
        $etype = $decoded['EventType'] ?? 'n/a';
        $sev   = $decoded['Severity']  ?? 'n/a';
        $msg   = $decoded['Message']   ?? ($decoded['MessageId'] ?? 'n/a');
        $desc  = "DESC Type=$etype; Severity=$sev; Message=".(is_string($msg)?$msg:json_encode($msg));
        if ($ctx) $desc .= "; Context=$ctx";
        @file_put_contents($logFile, "[$ts] $desc\n", FILE_APPEND | LOCK_EX);
    }
} else {
    @file_put_contents($logFile, "[$ts] DESC NonJSON payload\n", FILE_APPEND | LOCK_EX);
}

@file_put_contents($logFile, "[$ts] END 200\n", FILE_APPEND | LOCK_EX);
http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['ok'=>true,'logPath'=>$logFile], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
