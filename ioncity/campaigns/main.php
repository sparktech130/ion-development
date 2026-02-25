<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/main.php";

// ==== Obtener campañas ====
function obtenerCampaignsParam(
    $cod_campaign = null,
    $nombre_campaign = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $estado_campaign = null,
    $cod_tipo_camp = null,
    $activo = null,
    $limit = null,
) {
    $campaign_encurso = CAMPAIGN_ESTADOS['ESTADO_CURSO'];
    $campaign_procesando = CAMPAIGN_ESTADOS['ESTADO_PROCESANDO'];
    $campaign_final = CAMPAIGN_ESTADOS['ESTADO_FINAL'];

    $sql = "SELECT cpg.*, cpg.dispositivos as dispositivosStr, cpgt.*, u.nombre_usuario, ag.nombre_alerta,
    CASE
        WHEN CAST(cpg.analizado_hasta AS DATE) >= cpg.fecha_fin THEN '$campaign_final'
        WHEN cpg.activo = 1 AND cpg.fecha_fin >= CURRENT_DATE THEN '$campaign_encurso'
        WHEN cpg.activo = 1 AND cpg.fecha_fin < CURRENT_DATE THEN '$campaign_procesando'
        ELSE '$campaign_final'
    END as estado_campaign
    FROM 
        {{.CITY}}.campaign cpg 
    LEFT JOIN 
        {{.CITY}}.campaign_tipo cpgt ON cpg.cod_tipo_camp = cpgt.cod_tipo_camp
    LEFT JOIN 
        {{.CORE}}.usuarios u ON cpg.cod_usuario = u.cod_usuario
    LEFT JOIN 
        {{.CITY}}.alertas_gestion ag ON cpgt.cod_alertagest = ag.cod_alertagest
    WHERE 1 ";
    $values = [];

    if ($cod_campaign) {
        $sql .= 'AND cpg.cod_campaign = ? ';
        $values[] = $cod_campaign;
    }

    if ($nombre_campaign) {
        $sql .= 'AND cpg.nombre_campaign LIKE ? ';
        $values[] = "%$nombre_campaign%";
    }

    if ($cod_tipo_camp) {
        $sql .= 'AND cpg.cod_tipo_camp = ? ';
        $values[] = $cod_tipo_camp;
    }

    if ($estado_campaign) {
        $match_estados = function ($est) {
            return match ($est) {
                strtolower(CAMPAIGN_ESTADOS['ESTADO_CURSO']) => '(cpg.activo = 1 AND cpg.fecha_fin >= CURRENT_DATE)',
                strtolower(CAMPAIGN_ESTADOS['ESTADO_PROCESANDO']) => '(cpg.activo = 1 AND cpg.fecha_fin < CURRENT_DATE)',
                strtolower(CAMPAIGN_ESTADOS['ESTADO_FINAL']) => '(CAST(cpg.analizado_hasta AS DATE) >= cpg.fecha_fin OR cpg.activo = 0)',
                default => '0'
            };
        };

        if (is_array($estado_campaign)) {
            $sql .= 'AND (';
            foreach ($estado_campaign as $est) {
                $sql .= $match_estados(strtolower($est)) . ' OR ';
            }
            $sql = rtrim($sql, ' OR ') . ') ';
        } else if (is_string($estado_campaign)) {
            $sql .= 'AND ' . $match_estados(strtolower($estado_campaign)) . ' ';
        }
    }

    if ($fecha_ini && $fecha_fin) {
        $sql .= 'AND cpg.fecha_ini BETWEEN ? AND ? ';
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;

        $sql .= 'AND cpg.fecha_fin BETWEEN ? AND ? ';
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    } else if ($fecha_ini && !$fecha_fin) {
        $sql .= 'AND ? BETWEEN cpg.fecha_ini AND cpg.fecha_fin ';
        $values[] = $fecha_ini;
    } else if (!$fecha_ini && $fecha_fin) {
        $sql .= 'AND ? BETWEEN cpg.fecha_ini AND cpg.fecha_fin ';
        $values[] = $fecha_fin;
    }

    if ($activo) {
        $sql .= 'AND cpg.activo = 1 ';
    }

    $sql .= ' ORDER BY cpg.fecha_fin DESC ';

    if ($limit) {
        $sql .= 'LIMIT ?';
        $values[] = $limit;
    }

    try {
        $bd = obtenerConexion();
        $campaigns = ejecutarConsultaSQL($bd, $sql, $values, true);
        foreach ($campaigns as $cpg) {
            $cpg->dispositivos = obtenerDispositivosCampaign($cpg->cod_campaign);
            $cpg->alertas = obtenerDonutCampaigns($cpg->cod_campaign);
        }
        return $campaigns;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerReconocimientosCampaign(
    $cod_reconoc,
    $matricula = null,
    $color = null,
    $marca = null,
    $modelo = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $hora_ini = null,
    $hora_fin = null,
    $datetime_inicial = null,
    $datetime_final = null,
    $cod_dispositivo = null,
    $cod_alerta_gest = null,
    $nombre_alerta = null,
    $pais = null,
    $confidence = null,
    $orientacion = null,
    $order = null,
    $modulos = null,
    $nom_dispositivo = null,
    $tipo_vh = null,
    $velocidad_vehiculo = null,
    $nombre_lista = null,
    $limit = null,
    $page = null,
    $ultimo_cod_reconoc = null,
    $cod_campaign = null
) {
    if (!$cod_campaign)
        return false;

    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT DISTINCT 
			vr.*, 
			d.nom_dispositivo 
		FROM {{.CITY}}.campaign cpg
        RIGHT JOIN {{.CORE}}.vehiculos_reconocidos vr 
            ON FIND_IN_SET(vr.cod_dispositivo, REPLACE(cpg.dispositivos, ';', ',')) > 0 
            AND vr.fecha BETWEEN cpg.fecha_ini AND cpg.fecha_fin
		LEFT JOIN 
            {{.CORE}}.dispositivos d ON vr.cod_dispositivo = d.cod_dispositivo 
		LEFT JOIN 
            {{.CITY}}.listas_vehiculos lv ON lv.matricula = vr.matricula 
		LEFT JOIN 
            {{.CITY}}.listas l ON lv.cod_lista = l.cod_lista 
		";

    $where = 'WHERE 1 ';
    if ($matricula != null) {
        $where .= 'AND vr.matricula LIKE ? ';
        $values[] = "%$matricula%";
    }

    if ($nombre_lista != null) {
        $where .= 'AND l.nombre_lista LIKE ? ';
        $values[] = "%$nombre_lista%";
    }

    if ($tipo_vh != null) {
        $where .= 'AND vr.tipo_vh LIKE ? ';
        $values[] = "%$tipo_vh%";
    }

    if ($color != null) {
        $where .= 'AND vr.color = ? ';
        $values[] = $color;
    }

    if ($marca != null) {
        $where .= 'AND vr.marca LIKE ? ';
        $values[] = "%$marca%";
    }

    if ($modelo != null) {
        $where .= 'AND vr.modelo LIKE ? ';
        $values[] = "%$modelo%";
    }

    if ($fecha_ini != null && $fecha_fin != null) {
        $where .= 'AND vr.fecha BETWEEN ? AND ? ';
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    }

    if ($hora_ini != null && $hora_fin != null) {
        $where .= 'AND vr.hora BETWEEN ? AND ? ';
        $values[] = $hora_ini;
        $values[] = $hora_fin;
    }

    if ($datetime_inicial != null && $datetime_final != null) {
        $where .= "AND CONCAT(vr.fecha, ' ', vr.hora) BETWEEN ? AND ? ";
        $values[] = $datetime_inicial;
        $values[] = $datetime_final;
    } else if ($datetime_inicial != null) {
        $where .= "AND CONCAT(vr.fecha, '', vr.hora) > ? ";
        $values[] = $datetime_inicial;
    } else if ($datetime_final != null) {
        $where .= "AND CONCAT(vr.fecha, '', vr.hora) > ? ";
        $values[] = $datetime_final;
    }

    if ($cod_dispositivo != null) {
        if (is_array($cod_dispositivo)) {
            $where .= 'AND vr.cod_dispositivo IN (';
            for ($i = 0; $i < count($cod_dispositivo); $i++) {
                $where .= '?, ';
            }
            $where = rtrim($where, ', ') . ') ';
            $values = array_merge($values, $cod_dispositivo);
        } else {
            $where .= 'AND vr.cod_dispositivo = ? ';
            $values[] = $cod_dispositivo;
        }
    }

    if ($nom_dispositivo != null) {
        $where .= 'AND d.nom_dispositivo LIKE ? ';
        $values[] = "%$nom_dispositivo%";
    }

    if ($cod_reconoc != null) {
        $where .= 'AND vr.cod_reconoc = ? ';
        $values[] = $cod_reconoc;
    }

    if (!empty($cod_alerta_gest)) {
        $where .= 'AND (vr.cod_alertagest LIKE ? ';
        $values[] = '%' . current($cod_alerta_gest) . '%';

        while (next($cod_alerta_gest) != null) {
            $where .= 'OR vr.cod_alertagest LIKE ? ';
            $values[] = '%' . current($cod_alerta_gest) . '%';
        }
        $where .= ') ';
    }

    if ($nombre_alerta != null) {
        $where .= 'AND vr.nombre_alerta = ? ';
        $values[] = $nombre_alerta;
    }

    if ($pais != null) {
        $where .= 'AND vr.pais = ? ';
        $values[] = $pais;
    }

    if ($confidence != null) {
        $menorMayor = substr($confidence, 0, 1);
        $expl = explode($menorMayor, $confidence);

        if ($menorMayor != '<' && $menorMayor != '>' && $menorMayor != '=') {
            $menorMayor = '=';
        } else {
            $confidence = implode($expl);
        }

        $where .= 'AND vr.confidence ' . $menorMayor . ' ? ';
        $values[] = intval($confidence) / 100;
    }

    if ($velocidad_vehiculo != null) {
        $menorMayor = substr($velocidad_vehiculo, 0, 1);
        $expl = explode($menorMayor, $velocidad_vehiculo);

        if ($menorMayor != '<' && $menorMayor != '>' && $menorMayor != '=') {
            $menorMayor = '=';
        } else {
            $velocidad_vehiculo = implode($expl);
        }

        $where .= 'AND vr.velocidad_vehiculo ' . $menorMayor . ' ? ';
        $values[] = intval($velocidad_vehiculo);
    }

    if ($orientacion != null) {
        $where .= 'AND vr.orientacion = ? ';
        $values[] = $orientacion;
    }

    if ($modulos != null and !empty($modulos)) {
        $sql .= 'LEFT JOIN dispositivos_modulos dm ON vr.cod_dispositivo = dm.cod_dispositivo ';
        $where .= "AND dm.estado_canal <> '" . ESTADOS_CANALES['ESTADO_CADUCADO'] . "' AND dm.cod_modulo IN (";
        for ($i = 0; $i < count($modulos); $i++) {
            $values[] = $modulos[$i];
            $where .= '?, ';
        }
        $where = rtrim($where, ', ');
        $where .= ') ';
    }

    if ($ultimo_cod_reconoc != null) {
        $where .= 'AND vr.cod_reconoc <= ? ';
        $values[] = $ultimo_cod_reconoc;
    }

    if ($cod_campaign) {
        $where .= 'AND cpg.cod_campaign = ? ';
        $values[] = $cod_campaign;
    }

    $where .= 'GROUP BY vr.cod_reconoc ';

    if (!empty($order)) {
        $where .= ' ORDER BY ' . current($order) . ' ';
        while (next($order) != null) {
            $where .= ', ' . current($order) . ' ';
        }
    }

    $sql .= $where;

    if ($page != null && $limit != null) {
        $offset = ((int) $page - 1) * $limit;
        $sql .= ' LIMIT ?, ?;';
        $values[] = $offset;
        $values[] = $limit;
    } else {
        $sql .= ' LIMIT ?;';
        $values[] = $limit ?? 5000;
    }

    try {
        $sentencia = $bd->prepare($sql);
        $sentencia->execute($values);
        if ($sentencia->rowCount() == 0) {
            return [];
        } else {
            return $sentencia->fetchAll();
        }
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerDonutCampaigns($cod_campaign)
{
    $count = obtenerReconocimientosCampaignCount($cod_campaign);
    $count_an = obtenerReconocimientosCampaignCount($cod_campaign, true);
    $alertas = obtenerAlertasCampaignCount($cod_campaign)[0]->total ?? 0;

    return [
        'total_reconocimientos' => $count,
        'total_reconocimientos_analizados' => $count_an,
        'incidencias' => $alertas
    ];
}

function obtenerReconocimientosCampaignCount(
    $cod_campaign,
    $analizados = false
) {
    if (!$cod_campaign)
        return false;

    $bd = obtenerConexion();
    $values = [];

    $join = match ($analizados) {
        true => 'cpg.analizado_hasta',
        false => "CONCAT(cpg.fecha_fin, ' ', '23:59:59')"
    };

    $compr = $analizados ? 'True' : 'False';
    $sql =
        "SELECT cpg.cod_campaign, 
        CASE
            WHEN True = $compr AND CONCAT(cpg.fecha_ini, ' ', '00:00:00') = cpg.analizado_hasta THEN 0
            ELSE COUNT(DISTINCT vr.cod_reconoc)
        END as total, 
        CONCAT(cpg.fecha_ini, ' ', '00:00:00') as ini, $join as fin
		FROM 
            {{.CITY}}.campaign cpg
        LEFT JOIN 
            {{.CORE}}.vehiculos_reconocidos vr 
                ON FIND_IN_SET(vr.cod_dispositivo, REPLACE(cpg.dispositivos, ';', ',')) > 0 
                AND CONCAT(vr.fecha, ' ', vr.hora) BETWEEN CONCAT(cpg.fecha_ini, ' ', '00:00:00') AND $join
		LEFT JOIN 
            {{.CORE}}.dispositivos d ON vr.cod_dispositivo = d.cod_dispositivo 
        LEFT JOIN 
            {{.CORE}}.dispositivos_modulos dm ON vr.cod_dispositivo = dm.cod_dispositivo 
		";

    $where = 
    "WHERE cpg.cod_campaign IS NOT NULL 
    AND dm.estado_canal <> ?
    AND dm.cod_modulo = ? ";

    $values[] = ESTADOS_CANALES["ESTADO_CADUCADO"];
    $values[] = MODULOS["infringement"]["cod_modulo"];

    $where .= 'AND cpg.cod_campaign = ? ';
    $values[] = $cod_campaign;

    $sql .= $where;

    try {
        $recon = ejecutarConsultaSQL($bd, $sql, $values, true);

        return $recon[0]->total ?? 0;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerAlertasCampaignCount($cod_campaign)
{
    $values = [];
    $sql = "SELECT COUNT(a.cod_alerta) as total 
	FROM {{.CITY}}.alertas a 
	LEFT JOIN {{.CITY}}.alertas_gestion ag ON a.cod_alertagest = ag.cod_alertagest
	WHERE a.cod_campaign = ? ";
    $values[] = $cod_campaign;

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerDispositivosCampaign($cod_campaign)
{
    $sql = "SELECT d.cod_dispositivo, d.nom_dispositivo
    FROM 
        {{.CITY}}.campaign cpg 
    LEFT JOIN
        {{.CORE}}.dispositivos d ON FIND_IN_SET(d.cod_dispositivo, REPLACE(cpg.dispositivos, ';', ',')) > 0
    WHERE cpg.cod_campaign = ? ";
    $values = [$cod_campaign];

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerCampaignsCount()
{
    $sql = 'SELECT COUNT(cod_campaign) as total FROM {{.CITY}}.campaign ';
    $values = [];

    try {
        $bd = obtenerConexion();
        $cmps = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $cmps[0]->total ?? 0;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}


// ==== Crear, Modificar y Eliminar campañas ====
function insertarCampaign(
    $nombre_campaign = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $cod_tipo_camp = null,
    $cod_usuario = null,
    $coordenadas = null,
) {
    $dispositivos = [];
    $dispositivosIFG = obtenerDispositivosModulo(
        cod_modulo: MODULOS['infringement']['cod_modulo'],
    );

    if ($dispositivosIFG !== false) {
        $area = explode(';', $coordenadas);
        $areaFormatada = [];
        foreach ($area as $key => $val) {
            $aux = explode(',', $val);
            $areaFormatada[$key]['lat'] = $aux[0];
            $areaFormatada[$key]['lng'] = $aux[1];
        }

        foreach ($dispositivosIFG as $key => $value) {
            if ($value->coordenadas === null)
                continue;

            $punto = explode(',', $value->coordenadas);
            $puntoFormatado['lat'] = $punto[0];
            $puntoFormatado['lng'] = $punto[1];

            if (comprobarAreaCoordenadas($puntoFormatado, $areaFormatada) == true) {
                $dispositivos[] = $value->cod_dispositivo;
            }
        }
    }

    if (empty($dispositivos))
        return ['message' => 'No se han encontrado dispositivos válidos', 'error' => true];

    $dispositivos = implode(';', $dispositivos);
    $analizado_hasta = new DateTime($fecha_ini);
    $analizado_hasta = $analizado_hasta->format('Y-m-d H:i:s');

    $nombre_tabla = '{{.CITY}}.campaign';
    $datos_tabla = [
        'nombre_campaign' => $nombre_campaign,
        'fecha_ini' => $fecha_ini,
        'fecha_fin' => $fecha_fin,
        'cod_tipo_camp' => $cod_tipo_camp,
        'cod_usuario' => $cod_usuario,
        'coordenadas' => $coordenadas,
        'dispositivos' => $dispositivos,
        'analizado_hasta' => $analizado_hasta,
    ];

    $bd = obtenerConexion();
    $cod_campaign = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, true);
    return $cod_campaign;
}

function modificarCampaign(
    $cod_campaign,
    $nombre_campaign = null,
    $fecha_fin = null,
    $cod_tipo_camp = null,
    $coordenadas = null,
    $analizado_hasta = null,
    $activo = null
) {
    if (!$cod_campaign)
        return false;

    if ($coordenadas != null) {
        $dispositivos = [];
        $dispositivosIFG = obtenerDispositivosModulo(MODULOS['infringement']['cod_modulo']);

        if ($dispositivosIFG !== false) {
            $area = explode(';', $coordenadas);
            $areaFormatada = [];
            foreach ($area as $key => $val) {
                $aux = explode(',', $val);
                $areaFormatada[$key]['lat'] = $aux[0];
                $areaFormatada[$key]['lng'] = $aux[1];
            }

            foreach ($dispositivosIFG as $key => $value) {
                if ($value->coordenadas === null)
                    continue;

                $punto = explode(',', $value->coordenadas);
                $puntoFormatado['lat'] = $punto[0];
                $puntoFormatado['lng'] = $punto[1];

                if (comprobarAreaCoordenadas($puntoFormatado, $areaFormatada) == true) {
                    $dispositivos[] = $value->cod_dispositivo;
                }
            }
        }

        if (empty($dispositivos))
            return ['error' => true, 'message' => 'No se han encontrado dispositivos válidos'];

        $dispositivos = implode(';', $dispositivos);
    }

    $nombre_tabla = '{{.CITY}}.campaign';
    $datos_tabla = [
        'nombre_campaign' => $nombre_campaign,
        'fecha_fin' => $fecha_fin,
        'cod_tipo_camp' => $cod_tipo_camp,
        'coordenadas' => $coordenadas,
        'dispositivos' => $dispositivos ?? null,
        'analizado_hasta' => $analizado_hasta,
        'activo' => $activo
    ];
    $datos_condicionales = ['cod_campaign' => $cod_campaign];

    $bd = obtenerConexion();
    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

function eliminarCampaign(
    $cod_campaign = null
) {
    if (!$cod_campaign)
        return false;

    $nombre_tabla = '{{.CITY}}.campaign';
    $datos_condicionales = [
        'cod_campaign' => $cod_campaign
    ];
    $bd = obtenerConexion();
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

