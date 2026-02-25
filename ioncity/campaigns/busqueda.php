<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/campaigns/main.php";
acabarRequest(["message" => "Función no disponible", "error" => true], 400);

define("max_consultas_intervalo", 10000);

$fecha_hora_actual = new DateTime();
$fecha_actual = $fecha_hora_actual->format("Y-m-d");
$hora_actual = $fecha_hora_actual->format("H:i:s");

$fecha_hora_actual = $fecha_hora_actual->format("Y-m-d H:i:s");

$campaigns = obtenerCampaignsParam(null, null, null, null, null, true, null);
$campaigns_buscar = [];

foreach ($campaigns as $key => $cmp) {
    if (!isset($cmp->dispositivosStr)) continue;

    $fecha_hora_ini = explode(" ", $cmp->analizado_hasta);

    $fecha_ini = $fecha_hora_ini[0];
    $hora_ini = $fecha_hora_ini[1];

    $fecha_hora_fin = "{$cmp->fecha_fin} 23:59:59";

    $total = obtenerReconocimientosSinAlertaGestCount(
        $cmp->analizado_hasta,
        $fecha_hora_fin,
        explode(";", $cmp->dispositivosStr),
        $cmp->cod_alertagest
    )[0]->total ?? 0;

    if (
        $total < 0
        && $fecha_hora_fin < $fecha_hora_actual
    ) {
        modificarCampaign($cmp->cod_campaign, null, null, null, null, $fecha_hora_actual, "0");
        // echo "'{$fecha_hora_fin}' < '{$fecha_hora_actual}', caduca";
        continue;
    }

    if ($total > 0)
        $campaigns_buscar[] = [
            "campaign" => $cmp,
            "fecha_hora_fin" => $fecha_hora_fin,
            "dispositivos" => explode(";", $cmp->dispositivosStr),
            "cod_alertagest" => $cmp->cod_alertagest,
            "nombre_alerta" => $cmp->nombre_alerta,
            "total_reconocimientos" => $total,
            "limit_campaigns" => 0
        ];
}

if (empty($campaigns_buscar)) exit();

// 4 campañas, límite 100, 25 cada una
define("limit_campaigns", max_consultas_intervalo / count($campaigns_buscar));
$campaigns_buscar = limitarCampaigns($campaigns_buscar, limit_campaigns);

function limitarCampaigns($campaigns, $limit_campaigns)
{
    $obtenerLimit = function ($campaigns) {
        $suma = 0;

        foreach ($campaigns as $cmp) {
            $suma += $cmp["limit_campaigns"];
        }
        return $suma;
    };
    $restantes = 0;
    $campaigns_sin_completar = 0;
    $limit_actual = $obtenerLimit($campaigns);

    // echo json_encode([
    //     "restantes" => $restantes,
    //     "campaigns_sin_completar" => $campaigns_sin_completar,
    //     "limit_actual" => $limit_actual,
    //     "limit_campaigns" => $limit_campaigns
    // ]);

    if ($limit_actual + $limit_campaigns > max_consultas_intervalo)
        return $campaigns;

    foreach ($campaigns as $key => $cmp) {
        $l = $cmp["limit_campaigns"] + $limit_campaigns;

        if ($cmp["total_reconocimientos"] - $cmp["limit_campaigns"] <= 0) {
            continue;
        }

        if ($cmp["limit_campaigns"] == $cmp["total_reconocimientos"]) {
        } else if ($l >= $cmp["total_reconocimientos"]) {
            $resta = $l - $cmp["total_reconocimientos"];

            $campaigns[$key]["limit_campaigns"] = $cmp["total_reconocimientos"];
            $restantes += $resta;
        } else {
            $campaigns[$key]["limit_campaigns"] += $limit_campaigns;
            $campaigns_sin_completar++;
        }
    }

    if ($restantes > 0 && $campaigns_sin_completar > 0) {
        $limit_campaigns = round($restantes / $campaigns_sin_completar, PHP_ROUND_HALF_DOWN);
        return limitarCampaigns($campaigns, $limit_campaigns);
    }
    return $campaigns;
}

// echo json_encode($campaigns_buscar);
// exit();

$alertas = [];
$tiempo_dias = 30;

$insertarAlertaMatricula = function ($matricula, $cod_alertagest) use ($tiempo_dias) {
    if (!($matricula && $cod_alertagest))
        return false;

    $insertarAlerta = false;

    $dias_desde_ultima_alerta = obtenerTiempoUltimaAlertaCampaigns($matricula, $cod_alertagest);

    $insertarAlerta = $dias_desde_ultima_alerta > $tiempo_dias
        || $dias_desde_ultima_alerta == -1 ? true : false;

    return $insertarAlerta;
};

foreach ($campaigns_buscar as $cmp) {
    if ($cmp["total_reconocimientos"] <= 0) continue;

    $reconocimientos = obtenerReconocimientosSinAlertaGest(
        $cmp["campaign"]->analizado_hasta,
        $cmp["fecha_hora_fin"],
        $cmp["dispositivos"],
        $cmp["cod_alertagest"],
        $cmp["limit_campaigns"]
    );

    $ultima_fecha_hora = "";

    foreach ($reconocimientos as $recon) {
        if (
            rand(1, 300) === 10 // Condición random, TODO: Sustituir por API DGT
            && $insertarAlertaMatricula($recon->matricula, $cmp["cod_alertagest"])
        ) {
            // Inserta alerta
            echo "alerta en {$recon->cod_reconoc}\n";
            echo json_encode($recon);

            $cod_alertagest_modif = explode(";", $recon->cod_alertagest);
            $cod_alertagest_modif[] = $cmp["cod_alertagest"];
            $cod_alertagest_modif = implode(";", $cod_alertagest_modif);

            modificarReconocimientos($recon->cod_reconoc, $cod_alertagest_modif, null);

            $cod_alerta = insertarAlerta(
                $recon->cod_reconoc,
                $recon->matricula,
                $cmp["nombre_alerta"],
                $recon->cod_dispositivo,
                $fecha_actual,
                $hora_actual,
                "p",
                null,
                $fecha_hora_actual,
                $recon->foto,
                $cmp["cod_alertagest"],
                null,
                null,
                $cmp["campaign"]->cod_campaign,
            );

            $alertas[] = ['modulo' => 'infringement', "cod" => $cod_alerta];
        }
        $ultima_fecha_hora = "{$recon->fecha} {$recon->hora}";
    }
    $activo =
        $ultima_fecha_hora <= $cmp["fecha_hora_fin"]
        && $fecha_hora_actual < $cmp["fecha_hora_fin"];

    modificarCampaign(
        $cmp["campaign"]->cod_campaign,
        null,
        null,
        null,
        null,
        $ultima_fecha_hora,
        $activo ? "1" : "0"
    );
}

if (!empty($alertas))
    enviarAlertaSocket($alertas);

function obtenerReconocimientosSinAlertaGestCount(
    $datetime_ini,
    $datetime_fin,
    $dispositivos,
    $cod_alertagest
) {
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT count(DISTINCT vr.cod_reconoc) as total
		FROM vehiculos_reconocidos vr 
		LEFT JOIN dispositivos d ON vr.cod_dispositivo = d.cod_dispositivo 
		LEFT JOIN listas_vehiculos lv ON lv.matricula = vr.matricula 
		LEFT JOIN listas l ON lv.cod_lista = l.cod_lista 
        LEFT JOIN dispositivos_modulos dm ON vr.cod_dispositivo = dm.cod_dispositivo 
		";

    $where = "WHERE dm.estado_canal != '" . ESTADOS_CANALES["ESTADO_CADUCADO"] . "' 
    AND dm.cod_modulo = '" . MODULOS["infringement"]["cod_modulo"] . "' ";

    if ($datetime_ini != null && $datetime_fin != null) {
        $where .= "AND CONCAT(vr.fecha, ' ', vr.hora) BETWEEN ? AND ? ";
        $values[] = $datetime_ini;
        $values[] = $datetime_fin;
    } else if ($datetime_ini != null) {
        $where .= "AND CONCAT(vr.fecha, '', vr.hora) > ? ";
        $values[] = $datetime_ini;
    } else if ($datetime_fin != null) {
        $where .= "AND CONCAT(vr.fecha, '', vr.hora) > ? ";
        $values[] = $datetime_fin;
    }

    if ($dispositivos != null && is_array($dispositivos)) {
        $where .= "AND vr.cod_dispositivo IN (";
        for ($i = 0; $i < count($dispositivos); $i++) {
            $where .= "?, ";
        }
        $where = rtrim($where, ", ") . ") ";
        $values = array_merge($values, $dispositivos);
    }

    if ($cod_alertagest != null) {
        $where .= "AND (vr.cod_alertagest NOT LIKE ? OR vr.cod_alertagest IS NULL) ";
        $values[] = "%$cod_alertagest%";
    }

    if (!empty($order)) {
        $where .= " ORDER BY " . current($order) . " ";
        while (next($order) != null) {
            $where .= ", " . current($order) . " ";
        }
    }

    $sql .= $where;

    try {
        $sentencia = $bd->prepare($sql);
        $sentencia->execute($values);
        if ($sentencia->rowCount() == 0) {
            return [];
        } else {
            return $sentencia->fetchAll();
        }
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerReconocimientosSinAlertaGest(
    $datetime_ini,
    $datetime_fin,
    $dispositivos,
    $cod_alertagest,
    $limit
) {
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT DISTINCT 
			vr.*, 
			d.nom_dispositivo 
		FROM vehiculos_reconocidos vr 
		LEFT JOIN dispositivos d ON vr.cod_dispositivo = d.cod_dispositivo 
		LEFT JOIN listas_vehiculos lv ON lv.matricula = vr.matricula 
		LEFT JOIN listas l ON lv.cod_lista = l.cod_lista 
        LEFT JOIN dispositivos_modulos dm ON vr.cod_dispositivo = dm.cod_dispositivo 
		";

    $where = "WHERE dm.estado_canal != '" . ESTADOS_CANALES["ESTADO_CADUCADO"] . "' 
    AND dm.cod_modulo = '" . MODULOS["infringement"]["cod_modulo"] . "' ";

    if ($datetime_ini != null && $datetime_fin != null) {
        $where .= "AND CONCAT(vr.fecha, ' ', vr.hora) BETWEEN ? AND ? ";
        $values[] = $datetime_ini;
        $values[] = $datetime_fin;
    } else if ($datetime_ini != null) {
        $where .= "AND CONCAT(vr.fecha, '', vr.hora) > ? ";
        $values[] = $datetime_ini;
    } else if ($datetime_fin != null) {
        $where .= "AND CONCAT(vr.fecha, '', vr.hora) > ? ";
        $values[] = $datetime_fin;
    }

    if ($dispositivos != null && is_array($dispositivos)) {
        $where .= "AND vr.cod_dispositivo IN (";
        for ($i = 0; $i < count($dispositivos); $i++) {
            $where .= "?, ";
        }
        $where = rtrim($where, ", ") . ") ";
        $values = array_merge($values, $dispositivos);
    }

    if ($cod_alertagest != null) {
        $where .= "AND (vr.cod_alertagest NOT LIKE ? OR vr.cod_alertagest IS NULL) ";
        $values[] = "%$cod_alertagest%";
    }
    $where .= "GROUP BY vr.cod_reconoc ";

    if (!empty($order)) {
        $where .= " ORDER BY " . current($order) . " ";
        while (next($order) != null) {
            $where .= ", " . current($order) . " ";
        }
    }

    $sql .= $where;
    $sql .= "LIMIT ? ";
    $values[] = $limit;

    try {
        $sentencia = $bd->prepare($sql);
        $sentencia->execute($values);
        if ($sentencia->rowCount() == 0) {
            return [];
        } else {
            return $sentencia->fetchAll();
        }
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerTiempoUltimaAlertaCampaigns($matricula, $cod_alertagest)
{
    $ultima_alerta = obtenerAlertasParam(
        matricula: $matricula,
        alertas: $cod_alertagest,
    );
    $array_tiene_resultados = function ($datos_array) {
        return (!$datos_array || empty($datos_array) || isset($datos_array["error"])) ? false : true;
    };

    if ($array_tiene_resultados($ultima_alerta)) {
        $fecha_hora_alerta = $ultima_alerta[0]->fecha . " " . $ultima_alerta[0]->hora;

        $fecha_hora_alerta = new DateTime($fecha_hora_alerta);
        $fecha_hora_alerta->setTimezone(TIME_ZONE);

        $fecha_hora_actual = new Datetime("now");
        $fecha_hora_actual->setTimezone(TIME_ZONE);

        $days  = $fecha_hora_actual->diff($fecha_hora_alerta)->format('%a');
    }

    return $days ?? -1;
}

