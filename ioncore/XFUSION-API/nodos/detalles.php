<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

if (!isset($jsonobj2->id)) {
    acabarRequest([
        "message" => "Filtro necesario: 'id'",
        "error" => true,
    ]);
}
$id = $jsonobj2->id;

header('Content-Type: application/json');

try {
    // 1) Login
    require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/login.php";

    // 2) Nodos detallados (GET a cada @odata.id)
    $nodes = fd_listar_nodos_detalle_con_token($id);

    // 3) Salud y predicciones globales
    $resumen = fd_resumen_salud($nodes);

    // 4) Detalle del node usando SIEMPRE @odata.id si está disponible
    // Preferir la ruta real del recurso:
    $out = array(
        'generated_at' => date('c'),
        'summary'      => $resumen,
        'node'        => [],
    );
    foreach ($nodes as $node) {
        $nodePath = null;
        if (isset($node['@odata.id']) && $node['@odata.id']) {
            $nodePath = $node['@odata.id']; // p.ej. /redfish/v1/rich/Nodes/28d2c6... (válido)
        } else {
            // Fallback a construirla con Id (solo si no hay @odata.id)
            $nodeId = null;
            if (isset($node['Id']) && $node['Id']) { $nodeId = $node['Id']; }
            if ($nodeId) {
                $nodePath = '/redfish/v1/rich/Nodes/' . rawurlencode($nodeId);
            }
        }

        if (!$nodePath) { throw new RuntimeException("nodePath no encontrado"); }

        // Extraer el id "real" del último segmento de la ruta (para funciones que esperan id)
        $parts = explode('/', trim($nodePath, '/'));
        $realId = count($parts) > 0 ? $parts[count($parts)-1] : null;

        if (!$realId) { throw new RuntimeException("id no encontrada"); }

        // --- Componentes opcionales (descomenta si los quieres en la salida) ---
        $manager = fd_obtener_componente_nodo($realId, 'Manager');
        $cpu = fd_obtener_componente_nodo($realId, 'Processor');
        $mem = fd_obtener_componente_nodo($realId, 'Memory');
        $sto = fd_obtener_componente_nodo($realId, 'Storage');
        if ($sto && !isset($sto["error"])) {
            $sto["Drive"] = fd_obtener_componente_nodo($realId, 'Storage/Drive');
            $sto["RaidCard"] = fd_obtener_componente_nodo($realId, 'Storage/RaidCard');

            if (isset($sto["Drive"]["Members"])) {
                foreach ($sto["Drive"]["Members"] as $key => $member) {
                    $sto["Drive"]["Members"][$key] = fd_obtener_componente_nodo($realId, "Storage/Drive/{$member['DeviceID']}");
                }
            }
        }

        $pw = fd_obtener_componente_nodo($realId, 'Power');
        $thermal = fd_obtener_componente_nodo($realId, 'Thermal');
        $network = fd_obtener_componente_nodo($realId, 'NetworkAdapter');
        $eth = fd_obtener_componente_nodo($realId, 'NetworkInterface/EthernetInterface');
        $pcie = fd_obtener_componente_nodo($realId, 'PCIe');

        $acc = fd_obtener_componente_sistema($realId, 'Accounts');
        if (isset($acc["Members"])) {
            foreach ($acc["Members"] as $key => $member) {
                unset($acc["Members"][$key]["Password"]);
            }
        }

        $node['Components'] = array(
            'Manager' => $manager,
            'Processor' => $cpu,
            'Memory'     => $mem,
            'Storage'    => $sto,
            'Power' => $pw,
            'Thermal' => $thermal,
            'Network' => $network,
            'Ethernet' => $eth,
            'PCIe' => $pcie,
            'Accounts' => $acc,
        );

        // 5) Salida JSON (bonito para test)
        $out = array(
            'generated_at' => date('c'),
            'summary'      => $resumen,
            'node'        => $node,
        );
    }

    echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
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
        echo json_encode(array('error' => $msg), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }
}
