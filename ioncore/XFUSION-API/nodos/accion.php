<?php
/* acciones.php
   - POWER exige nodeId y usa fd_resumen_nodo() (vía get_ibmc_ip_from_resumen)
*/
/* $_SESSION["AUTHED"] = false; */

header('Content-Type: application/json');

require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/main.php";


// CONFIG
fd_init_config([
    'host'     => $_ENV["FD_HOST"],
    'user'     => $_ENV["FD_USER"],
    'password' => $_ENV["FD_PASSWORD"],
    'verify'   => false,
    'apiV'     => '0.9',
], true);

$inputJson = file_get_contents('php://input');

$req = json_decode($inputJson ?: '[]', true);
if (!is_array($req)) {
    acabarRequest([
        "message" => "JSON inválido",
        "error" => true,
    ], 400);
}

/* ====== Acciones permitidas ====== */
$allowed = [
    "forced_power_off",
    "forced_restart",
    "uid_on",
    "jump_to_ibmc",
    "kvm",
    "refresh",
    "remove",
    "change_mgmt_password",
    "format_disk",
    "export_logs",
    "ibmc_ip_config",
    "task_status",
    "task_history"
];

$action   = $req['action']  ?? null;
$nodeId   = $req['nodeId']  ?? null;   // OBLIGATORIO para POWER
$systemId = $req['systemId']?? null;   // para otras acciones
$params   = $req['params']  ?? [];

/* ====== Validación ====== */
if (!in_array($action, $allowed, true)) {
    acabarRequest( [
        "message" => "Acción no permitida",
        "error" => true,
        "allowed" => $allowed,
    ], 400);
}

$resumen_task = function ($response) {
    $data = $response['data'] ?? [];
    $progress = $data['Progress'] ?? null;

    $sub = [];
    if (!empty($data['SubTasks']) && is_array($data['SubTasks'])) {
        $sub = $data['SubTasks'][0] ?? [];
    }

    $subStatus = $sub['Status'] ?? null;            // e.g. "Finish"
    $subType   = $sub['Type'] ?? null;              // e.g. "ForceRestart"
    $rebootFailed = (bool)($sub['RebootSetFailed'] ?? false);

    $finished = ($progress === 100 || $subStatus === 'Finish');
    $success  = $finished && !$rebootFailed;

    $hint = $success
    ? 'La tarea terminó correctamente.'
    : ($rebootFailed
        ? 'El BMC no pudo aplicar ForceRestart (RebootSetFailed=true). Suele resolverse con ForceOff y luego On.'
        : 'La tarea no está completada o tiene avisos. Revisa SubTasks/StepInfo.');

    return [
        'finished'        => $finished,
        'success'         => $success,
        'progress'        => $progress,
        'subStatus'       => $subStatus,
        'type'            => $subType,
        'rebootSetFailed' => $rebootFailed,
        'hint'            => $hint,
    ];
};

// ACCIONES: 
try {
    switch ($action) {
        case 'forced_power_off': {
            if (empty($nodeId)) throw new Exception("nodeId requerido");
            $ip = get_ibmc_ip_from_resumen($nodeId);
            if (!$ip) throw new Exception("No se pudo resolver IP/Host desde fd_resumen_nodo(nodeId={$nodeId})");
            $r = power_via_unified_api($ip, 'ForceOff');
            $ok   = resp_ok($r);
            $task = $r['headers']['Task'] ?? null;

            acabarRequest([
                'ok'      => $ok,
                'status'  => $r['status'] ?? null,
                'taskId'    => $task,
                'nodeId'  => $nodeId,
                'ibmc_ip' => $ip,
            ]);
            break;
        }

        case 'forced_restart': {
            if (empty($nodeId)) throw new Exception("nodeId requerido");

            $ip = get_ibmc_ip_from_resumen($nodeId);
            if (!$ip) throw new Exception("No se pudo resolver IP/Host desde fd_resumen_nodo(nodeId={$nodeId})");

            $r = power_via_unified_api($ip, 'ForceRestart');
            $ok   = resp_ok($r);
            $task = $r['headers']['Task'] ?? "";

            $task_status_res = get_task_status($task);

            acabarRequest([
                'ok'      => $ok,
                'status'  => $r['status'] ?? null,
                'taskId'    => $task,
                'task_status' => $resumen_task($task_status_res),
                'nodeId'  => $nodeId,
                'ibmc_ip' => $ip,
            ]);
            break;
        }

        case 'uid_on': {           // Lit | Off | Blinking
            if (empty($nodeId)) throw new Exception("nodeId requerido");
            $state = $params['uid_state'] ?? 'Lit';
            $r = http_patch("/redfish/v1/rich/Nodes/{$nodeId}/IndicatorLED", ["IndicatorLED"=>$state], [200,202,204]);

            $ok = resp_ok($r);

            acabarRequest([
                'ok' => $ok,
                'data' => $r["data"] ?? [],
            ]);
            break;
        }

        case 'refresh': {
            if (empty($nodeId)) throw new Exception("nodeId requerido");
            $r = http_post("/redfish/v1/rich/Nodes/{$nodeId}/Actions/Node.Refresh", (object)[], [200,202,204]);

            $ok = resp_ok($r);

            acabarRequest([
                'ok' => $ok,
                'data' => $r["data"] ?? [],
            ]);
            break;
        }

        case 'jump_to_ibmc': {
            if (empty($nodeId)) throw new Exception("nodeId requerido");
            $res  = function_exists('fd_resumen_nodo') ? fd_resumen_nodo($nodeId) : null;
            $host = $res['IP'] ?? null;
            if (!$host) {
                $mgr = http_get("/redfish/v1/rich/Nodes/{$nodeId}/Manager", [200]);
                $host = $mgr['data']['IPv4Address']['Address'] ?? null;
            }
            if (!$host) throw new Exception("No se pudo obtener el host del iBMC");

            /* $info = http_post( */
            /*     "/redfish/v1/rich/Nodes/{$nodeId}/Actions/Node.BMCLogin", */
            /*     (object)[], */
            /*     [200, 202, 204], */
            /* ); */

            acabarRequest([
                "ok" => true,
                "ibmc_url" => "https://{$host}/",
                "nodeId" => $nodeId,
                /* "info" => $info, */
            ]);
            break;
        }

        case 'kvm': {
            if (empty($nodeId)) throw new Exception("nodeId requerido");
            $mgr = http_get("/redfish/v1/rich/Nodes/{$nodeId}/Manager", [200]);
            $host = $mgr['data']['EthernetInterface'][0]['IPv4Addresses'][0]['Address'] ?? null;

            /* $info = http_post( */
            /*     "/redfish/v1/rich/Nodes/{$nodeId}/Actions/Node.KVMLogin",  */
            /*     (object)[ ], */
            /*     [200, 202, 204] */
            /* ); */

            acabarRequest([
                "ok" => true,
                "hint" => "KVMLogin",
                "manager" => $mgr['data'] ?? null,
                /* "info" => $info["data"], */
            ]);
            break;
        }

        case 'export_logs': {
            if (empty($systemId)) throw new Exception("systemId requerido");
            $r = http_get("/redfish/v1/Systems/{$systemId}/LogServices", [200]);

            $data = $r["data"];
            acabarRequest($data); 
            break;
        }

        case 'remove': {
            $deviceIds = $params['deviceIds'] ?? ($nodeId ? [$nodeId] : null);
            if (!$deviceIds) throw new Exception("deviceIds o nodeId requerido");
            $body = ["DeviceIDs"=>$deviceIds];
            $r = http_post("/unifiedapi/v1/Managers/Actions/Managers.RemoveDevice", $body, [200,201,202,204]);
            $ok = resp_ok($r);

            acabarRequest([
                'ok' => $ok,
                'data' => $r["data"] ?? [],
            ]);
            break;
        }

        case 'change_mgmt_password': {
            if (empty($systemId)) throw new Exception("systemId requerido");
            $username = $params['username'] ?? null;
            $newpass  = $params['new_password'] ?? null;
            if (!$username || !$newpass) throw new Exception("username y new_password requeridos");

            $acc = http_get("/redfish/v1/Systems/{$systemId}/Accounts", [200]);
            $memberPath = null;
            if (!empty($acc['data']['Members']) && is_array($acc['data']['Members'])) {
                foreach ($acc['data']['Members'] as $m) {
                    $detail = http_get($m['@odata.id'], [200]);
                    if (($detail['data']['UserName'] ?? null) === $username) {
                        $memberPath = $detail['data']['@odata.id'] ?? $m['@odata.id'];
                        break;
                    }
                }
            }
            if (!$memberPath) throw new Exception("Usuario no encontrado en Accounts");

            $ok = resp_ok($r);

            acabarRequest([
                'ok' => $ok,
                'data' => $r["data"] ?? [],
            ]);
            break;
        }

        case 'format_disk': {
            if (empty($systemId)) throw new Exception("systemId requerido");
            $driveId = $params['driveId'] ?? null;
            if (empty($driveId)) throw new Exception("driveId requerido");
            $info = http_get("/redfish/v1/Systems/{$systemId}/Storage", [200]);
            acabarRequest([
                "ok"=>true,
                "message"=>"Localiza tu drive y ejecuta la acción de borrado con tus helpers.",
                "storage"=>$info['data'] ?? null
            ]);
            break;
        }

        case 'ibmc_ip_config': {
            if (empty($nodeId)) throw new Exception("nodeId requerido");
            $ifId = $params['ibmc_if_id'] ?? null;
            $ipv4 = $params['ipv4'] ?? null; // ["Address","SubnetMask","GateWay","AddressOrigin"]
            if (empty($ifId) || empty($ipv4)) throw new Exception("ibmc_if_id e ipv4 requeridos");
            $r = http_patch("/redfish/v1/rich/Nodes/{$nodeId}/Manager/EthernetInterfaces/{$ifId}", [
                "IPv4Addresses" => [ $ipv4 ]
            ], [200,204]);
            $ok = resp_ok($r);

            acabarRequest([
                'ok' => $ok,
                'data' => $r["data"] ?? [],
            ]);
            break;
        }

        case 'task_status': {
            $taskId = $params['taskId'] ?? null;
            if (!$taskId) throw new Exception("params.taskId requerido");

            $r = get_task_status($taskId);
            $ok = resp_ok($r);

            acabarRequest([
                'ok' => $ok,
                'taskId'  => $taskId,
                'task_status' => $resumen_task($r)
            ]);
            break;
        }	

        case 'task_history': {
            $r = get_task_history($nodeId ?? "");
            $ok = resp_ok($r);

            acabarRequest([
                'ok' => $ok,
                'data' => $r["data"] ?? [],
            ]);
            break;
        }	
    }
} catch (Throwable $e) {
    $res = $e->getMessage();
    $res = explode("JSON", $res);

    acabarRequest([
        "message" => $res[0] ?? "",
        "raw_error" => json_decode($res[1] ?? ""),
        "error" => true,
    ], 400);
}
