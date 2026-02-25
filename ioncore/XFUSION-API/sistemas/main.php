<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/main.php";

/* =================== LISTAR =================== */

function fd_listar_sistemas($ctx) {
    if (!is_array($ctx)) throw new RuntimeException('Contexto inválido.');

    $headers = array('Accept: application/json', 'X-Auth-Token: ' . $ctx['x_auth_token']);
    $r = fd_http('GET', $ctx['base_url'], '/redfish/v1/Systems', $headers, null, $ctx['verify_tls'], $ctx['api_version'], null, array(200));

    $members = $r["data"]["Members"] ?? [];

    if (isset($ctx["id"])) {
        $systems = [];
        foreach ($members as $s) {
            if ($s["DeviceID"] != $ctx["id"]) {
                continue;
            }
            $systems[] = $s;
        }
    } else {
        $systems = $members;
    }

    if (($ctx['detailed'] ?? false) === true) {
        foreach ($systems as $key => $m) {
            $uri = null;
            if (isset($m['@odata.id'])) { $uri = $m['@odata.id']; }
            if (!$uri) continue;

            $sys = http_get($uri, [200]);
            $systems[$key] = $sys["data"] ?? [];
        }
    }

    return $systems;
}

function fd_listar_sistemas_con_token($id = null, $detailed = false) {
    $ctx = array();
    $ctx['base_url'] = rtrim($_SESSION["FD"]->host, '/');
    $ctx['verify_tls'] = (bool)$_SESSION["FD"]->verify;
    $ctx['api_version'] = $_SESSION["FD"]->apiV;
    $ctx['auth_mode'] = 'session';
    $ctx['x_auth_token'] = $_SESSION["FD"]->token;
    $ctx['session_location'] = null;
    $ctx['detailed'] = $detailed;
    $ctx['id'] = $id;

    $sistemas = fd_listar_sistemas($ctx);
    return $sistemas;
}

