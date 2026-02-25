<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/XFUSION-API/main.php";
function fd_obtener_estadisticas(
    $DeviceID = null,
    $StartTime = null,
    $EndTime = null,
) {
    if (!(
        $DeviceID && is_string($DeviceID) &&
            $StartTime && is_string($StartTime) &&
            $EndTime && is_string($EndTime)
    )) {
        return [
            "message" => "Parámetros necesarios no recibidos o inválidos.",
            "error" => true,
        ];
    }

    $returnObj = [];
    $path = '/redfish/v1/rich/Statistics/Action/Query';
    $headers = [
        "Accept: application/json",
        "Content-Type: application/json",
        "X-Auth-Token: {$_SESSION["FD"]->token}",
    ];

    $body = [
        "DeviceID" => [$DeviceID],
        "StartTime" => $StartTime,
        "EndTime" => $EndTime,
    ];
    try {
        $r = fd_http(
            method: 'POST',
            baseUrl: $_SESSION["FD"]->host,
            path: $path,
            headers: $headers,
            body: json_encode($body),
            verifyTls: (bool)$_SESSION["FD"]->verify,
            apiVersion: $_SESSION["FD"]->apiV,
            expectStatus: array(200)
        );

        $returnObj = $r['data'];
    } catch (Throwable $th) {
        $m = $th->getMessage();
        $m = explode("JSON", $m);
        [$m, $raw] = $m;
        $raw = json_decode($raw, true);

        $returnObj = [
            "message" => "Ha habido un error al procesar la solicitud: {$m}",
            "req" => [
                "baseUrl" => $_SESSION["FD"]->host,
                "path" => $path,
                "headers" => $headers,
                "body" => $body,
                "verifyTls" => (bool)$_SESSION["FD"]->verify,
                "apiVersion" => $_SESSION["FD"]->apiV,
            ],
            "ex_raw" => $raw["error"],
            "error" => true,
        ];
    } catch (Exception $e) {
        $m = $e->getMessage();
        $returnObj = [
            "message" => "Ha habido un error al procesar la solicitud: {$m}",
            "error" => true,
        ];
    } finally {
        return $returnObj;
    }
}

if (!defined("EMPTYOBJECT")){
    define("EMPTYOBJECT", (object)[]);
}



function procesar_estadisticas($stats) {
    if (!(
        isset($stats["Results"]) && 
            !empty($stats["Results"])
    )) {
        return $stats;
    }
    $procesar = function ($metrics) {
        if (!$metrics) { return []; }

        foreach ($metrics as $key => $m) {
            $metricInfo = $m["MetricInfo"] ?? null;
            if (!$metricInfo) {
                continue;
            }

            $mI = [];
            foreach ($metricInfo as $info) {
                foreach ($info["Times"] as $timeKey => $ts) {
                    if (!isset($mI[$ts])) {
                        $mI[$ts] = [];
                    }

                    $mI[$ts][$info["MemberName"]] = $info["Values"][$timeKey];
                }
            }

            ksort($mI, SORT_ASC);
            $stats = [];
            foreach ($mI as $ts => $value) {
                $fecha_hora = date("Y-m-d H:i:s", $ts);

                $value["FechaHora"] = $fecha_hora;
                $stats[] = $value;
            }

            $metrics[$key]["MetricInfo"] = [
                "DeviceID" => $metrics[$key]["MetricInfo"][0]["DeviceID"] ?? null,
                "Stats" => $stats,
            ];
        }


        return $metrics;
    };

    $results = $stats["Results"][0];
    foreach ($results as $key => $r) {
        $results[$key]["Metrics"] = $procesar($r["Metrics"] ?? null);
    }
    return $results;
}

