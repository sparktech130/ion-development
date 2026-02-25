<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

function insertarReconocimientos(
    $cod_provincia,
    $cod_poblacion,
    $fecha,
    $hora,
    $matricula,
    $pais,
    $confidence,
    $foto,
    $fotop,
    $incidencia,
    $cod_dispositivo,
    $fecha_modif,
    $marca,
    $modelo,
    $color,
    $tipo_vh,
    $estado,
    $distintivo,
    $velocidad_vehiculo,
    $latitud,
    $longitud,
    $orientacion,
    $cod_alertagest,
    $cod_modulo = null,
    $llamarNode = false,
    $observaciones = null,
    $cod_usuario = null,
) {
    try {
        if ($matricula != null) {
            $matricula = strtoupper($matricula);
        }

        $nombre_tabla = "{{.CORE}}.vehiculos_reconocidos";
        $datos_tabla = [
            "cod_provincia" => $cod_provincia,
            "cod_poblacion" => $cod_poblacion,
            "fecha" => $fecha,
            "hora" => $hora,
            "matricula" => $matricula,
            "pais" => $pais,
            "confidence" => $confidence,
            "foto" => $foto,
            "fotop" => $fotop,
            "incidencia" => $incidencia,
            "cod_dispositivo" => $cod_dispositivo,
            "fecha_modif" => $fecha_modif,
            "marca" => $marca,
            "modelo" => $modelo,
            "color" => $color,
            "tipo_vh" => $tipo_vh,
            "estado" => $estado,
            "distintivo" => $distintivo,
            "velocidad_vehiculo" => $velocidad_vehiculo,
            "latitud" => $latitud,
            "longitud" => $longitud,
            "orientacion" => $orientacion,
            "observaciones" => $observaciones,
            "cod_usuario" => $cod_usuario,
            "cod_alertagest" => $cod_alertagest,
            "modulos" => $cod_modulo
        ];

        if (!dispositivoTieneModulos($cod_dispositivo)) {
            return [
                "message" => "El dispositivo no tiene los módulos necesarios",
                "error" => true,
            ];
        }

        $bd = obtenerConexion();
        $cod_reconoc = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, true, false);
        if (!($cod_reconoc !== false && !isset($cod_reconoc["error"]))) {
            return $cod_reconoc;
        }

        if ($llamarNode === true) {
            enviarReconocimientoSocket($cod_reconoc, $cod_dispositivo);
        }
        return $cod_reconoc;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "insert", $e);
    }
}


function modificarReconocimientos(
    $cod_reconoc,
    $cod_alertagest = null,
    $nombre_alerta = null,
    $matricula = null,
    $tipo_vh = null,
    $marca = null,
    $modelo = null,
    $color = null,
    $pais = null
) {
    $bd = obtenerConexion();

    $nombre_tabla = "{{.CORE}}.vehiculos_reconocidos";
    $datos = [
        "cod_alertagest" => $cod_alertagest,
        "nombre_alerta" => $nombre_alerta,
        "tipo_vh" => $tipo_vh,
        "marca" => $marca,
        "modelo" => $modelo,
        "color" => $color,
        "matricula" => $matricula,
        "pais" => $pais,
    ];
    $datos_condicionales = [
        "cod_reconoc" => $cod_reconoc,
    ];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

function obtenerReconocimientosParamLimitGroupByModulo(
    $cod_reconoc = null,
    $cod_dispositivo = null,
    $limit = null,
    $modulos = null,
) {
    $bd = obtenerConexion();
    $values = [];
    $modulo_parking = MODULOS["parking"]["cod_modulo"];
    $estado_caducado = ESTADOS_CANALES["ESTADO_CADUCADO"];

    $sql = "SELECT ranked.*, d.nom_dispositivo, d.direccion_mac, d.deviceId
	FROM (
	SELECT vr.*, dm.cod_modulo, ROW_NUMBER() OVER (PARTITION BY dm.cod_modulo ORDER BY vr.fecha DESC, vr.hora DESC) AS rn 
    FROM 
        {{.CORE}}.vehiculos_reconocidos vr
    LEFT JOIN 
        {{.CORE}}.dispositivos_modulos dm 
            ON vr.cod_dispositivo = dm.cod_dispositivo AND dm.cod_modulo != ?
	WHERE dm.estado_canal != ? ";
    $values[] = $modulo_parking;
    $values[] = $estado_caducado;

    if (isset($cod_dispositivo)) {
        $sql .= "AND vr.cod_dispositivo = ? ";
        $values[] = $cod_dispositivo;
    }

    if (isset($cod_reconoc)) {
        $sql .= "AND vr.cod_reconoc = ? ";
        $values[] = $cod_reconoc;
    }

    if ($modulos != null and !empty($modulos)) {
        $sql .= "AND dm.cod_modulo IN (";
        for ($i = 0; $i < count($modulos); $i++) {
            $values[] = $modulos[$i];
            $sql .= "?, ";
        }
        $sql = rtrim($sql, ", ");
        $sql .= ") ";
    }

    $sql .= ") AS ranked
	LEFT JOIN {{.CORE}}.dispositivos d ON d.cod_dispositivo = ranked.cod_dispositivo
	ORDER BY fecha DESC, hora DESC ";

    if (isset($limit)) {
        $sql .= "LIMIT ? ";
        $values[] = $limit;
    }

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerReconocimientosCount($modulos)
{
    $values = [];
    $sql = "SELECT COUNT(DISTINCT cod_reconoc) as total
	FROM {{.CORE}}.vehiculos_reconocidos vr
	";

    if ($modulos != null) {
        $sql .= "LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON vr.cod_dispositivo = dm.cod_dispositivo 
		AND dm.estado_canal != '" . ESTADOS_CANALES["ESTADO_CADUCADO"] . "' ";
        $sql .= "WHERE 1 ";

        if (!empty($modulos)) {
            $v = array_map(
                array: $modulos,
                callback: function () {
                    return "?";
                }
            );

            $sql .= "AND dm.cod_modulo IN (" . implode(", ", $v) . ") ";
            array_push($values, ...$modulos);
        } else if (is_string($modulos) or is_int($modulos)) {
            $sql .= "AND dm.cod_modulo = ? ";
            $values[] = $modulos;
        }
    }

    try {
        $bd = obtenerConexion();
        $row = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $row[0]->total ?? 0;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerReconocimientos(
    $cod_reconoc = null,
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
    $order = ["vr.fecha DESC", "vr.hora DESC"],
    $modulos = null,
    $nom_dispositivo = null,
    $tipo_vh = null,
    $velocidad_vehiculo = null,
    $nombre_lista = null,
    $cod_area = null,
    $tipo_area = null,
    $limit = null,
    $page = null,
    $ultimo_cod_reconoc = null,
    $marcado = null,
    $cod_usuario = null,
    $h24 = false
) {
    $bd = obtenerConexion();
    $values = [
        $_SESSION["cod_usuario_token"] ?? "",
    ];
    $sql =
        "SELECT 
			vr.cod_reconoc, vr.fecha, vr.hora, vr.matricula, vr.pais,
            vr.confidence, vr.foto, vr.fotop, vr.cod_dispositivo, d.nom_dispositivo,
            vr.marca, vr.modelo, vr.color, vr.tipo_vh, vr.estado, vr.velocidad_vehiculo,
            vr.orientacion, vr.cod_alertagest, vr.modulos, vr.cod_usuario,
            CASE WHEN vrm.cod_reconoc IS NULL 
                THEN false
                ELSE true 
            END as marcado
		FROM {{.CORE}}.vehiculos_reconocidos vr 
		LEFT JOIN {{.CORE}}.dispositivos d ON vr.cod_dispositivo = d.cod_dispositivo 
        LEFT JOIN {{.CORE}}.vehiculos_reconocidos_mark vrm ON vr.cod_reconoc = vrm.cod_reconoc AND vrm.cod_usuario = ?
		";

    $where = "WHERE 1 ";
    if ($marcado) {
        $where .= "AND vrm.cod_reconoc IS NOT NULL ";
    }

    if ($cod_usuario) {
        $where .= "AND vr.cod_usuario = ? ";
        $values[] = $cod_usuario;
    }

    if ($matricula != null) {
        $where .= "AND vr.matricula LIKE ? ";
        $values[] = "%$matricula%";
    }

    if ($nombre_lista != null) {
        $sql .= "LEFT JOIN {{.CITY}}.listas_vehiculos lv ON lv.matricula = vr.matricula 
		LEFT JOIN {{.CITY}}.listas l ON lv.cod_lista = l.cod_lista ";
        $where .= "AND l.nombre_lista LIKE ? ";
        $values[] = "%$nombre_lista%";
    }

    if ($tipo_vh != null) {
        $where .= "AND vr.tipo_vh LIKE ? ";
        $values[] = "%$tipo_vh%";
    }

    if ($color != null) {
        $where .= "AND vr.color = ? ";
        $values[] = $color;
    }

    if ($marca != null) {
        $where .= "AND vr.marca LIKE ? ";
        $values[] = "%$marca%";
    }

    if ($modelo != null) {
        $where .= "AND vr.modelo LIKE ? ";
        $values[] = "%$modelo%";
    }

    if ($h24 === true) {
        $where .= "AND CONCAT(vr.fecha, ' ', hour(vr.hora)) >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ";
    } else {
        if ($fecha_ini != null && $fecha_fin != null) {
            $where .= "AND vr.fecha BETWEEN ? AND ? ";
            $values[] = $fecha_ini;
            $values[] = $fecha_fin;
        }

        if ($hora_ini != null && $hora_fin != null) {
            $where .= "AND vr.hora BETWEEN ? AND ? ";
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
    }

    if ($cod_dispositivo != null) {
        if (is_array($cod_dispositivo)) {
            $where .= "AND vr.cod_dispositivo IN (";
            for ($i = 0; $i < count($cod_dispositivo); $i++) {
                $where .= "?, ";
            }
            $where = rtrim($where, ", ") . ") ";
            $values = array_merge($values, $cod_dispositivo);
        } else {
            $where .= "AND vr.cod_dispositivo = ? ";
            $values[] = $cod_dispositivo;
        }
    }

    if ($nom_dispositivo != null) {
        $where .= "AND d.nom_dispositivo LIKE ? ";
        $values[] = "%$nom_dispositivo%";
    }

    if ($cod_reconoc != null) {
        $where .= "AND vr.cod_reconoc = ? ";
        $values[] = $cod_reconoc;
    }

    if (!empty($cod_alerta_gest)) {
        $where .= "AND (vr.cod_alertagest LIKE ? ";
        $values[] = "%" . current($cod_alerta_gest) . "%";

        while (next($cod_alerta_gest) != null) {
            $where .= "OR vr.cod_alertagest LIKE ? ";
            $values[] = "%" . current($cod_alerta_gest) . "%";
        }
        $where .= ") ";
    }

    if ($nombre_alerta != null) {
        $where .= "AND vr.nombre_alerta = ? ";
        $values[] = $nombre_alerta;
    }

    if ($pais != null) {
        $where .= "AND vr.pais = ? ";
        $values[] = $pais;
    }

    if ($cod_area != null || $tipo_area != null) {
        $sql .= " LEFT JOIN {{.CITY}}.dispositivo_area disp_ar ON disp_ar.cod_dispositivo = d.cod_dispositivo
            LEFT JOIN {{.CITY}}.area_restringida ar ON disp_ar.cod_area = disp_ar.cod_area ";

        if ($cod_area) {
            $where .= "AND ar.cod_area = ? ";
            $values[] = $cod_area;
        }

        if ($tipo_area) {
            $where .= "AND ar.tipo_area = ? ";
            $values[] = $tipo_area;
        }
    }

    if ($confidence != null) {
        $menorMayor = substr($confidence, 0, 1);
        $expl = explode($menorMayor, $confidence);

        if ($menorMayor != "<" && $menorMayor != ">" && $menorMayor != "=") {
            $menorMayor = "=";
        } else {
            $confidence = implode($expl);
        }

        $where .= "AND vr.confidence " . $menorMayor . " ? ";
        $values[] = intval($confidence) / 100;
    }

    if ($velocidad_vehiculo != null) {
        $menorMayor = substr($velocidad_vehiculo, 0, 1);
        $expl = explode($menorMayor, $velocidad_vehiculo);

        if ($menorMayor != "<" && $menorMayor != ">" && $menorMayor != "=") {
            $menorMayor = "=";
        } else {
            $velocidad_vehiculo = implode($expl);
        }

        $where .= "AND vr.velocidad_vehiculo " . $menorMayor . " ? ";
        $values[] = intval($velocidad_vehiculo);
    }

    if ($orientacion != null) {
        $where .= "AND vr.orientacion = ? ";
        $values[] = $orientacion;
    }

    if ($modulos != null) {
        $sql .= "LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON vr.cod_dispositivo = dm.cod_dispositivo ";
        $sql .= "AND dm.estado_canal <> '" . ESTADOS_CANALES["ESTADO_CADUCADO"] . "' ";
        $where .= "AND dm.cod_modulo = ? ";
        if (!empty($modulos)) {
            $values[] = $modulos[0];
        } else if (is_string($modulos) or is_int($modulos)) {
            $values[] = $modulos;
        }
    }

    if ($ultimo_cod_reconoc != null) {
        $where .= "AND vr.cod_reconoc <= ? ";
        $values[] = $ultimo_cod_reconoc;
    }

    // $where .= "GROUP BY vr.cod_reconoc ";

    if (is_array($order) && !empty($order)) {
        $where .= " ORDER BY " . current($order) . " ";
        while (next($order) != null) {
            $where .= ", " . current($order) . " ";
        }
    }

    $sql .= $where;

    if ($page != null && $limit != null) {
        $offset = ((int) $page - 1) * $limit;
        $sql .= " LIMIT ?, ?;";
        $values[] = $offset;
        $values[] = $limit;
    } else {
        $sql .= " LIMIT ?;";
        $values[] = $limit ?? 5000;
    }

    try {
        $rows = ejecutarConsultaSQL($bd, $sql, $values, true);
        $mapped = array_map(function ($row) {
            $row->marcado = $row->marcado == 1 ? true : false;

            return $row;
        }, $rows);
        return $mapped;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerReconocimientosGroupBy(
    $fecha_ini = null,
    $fecha_fin = null,
    $hora_ini = null,
    $hora_fin = null,
    $matricula = null,
    $color = null,
    $marca = null,
    $tipo_vh = null,
    $pais = null,
    $dispositivos = null,
    $velocidad_vehiculo = null,
    $campos = null,
    $order = null,
    $cod_provincia = null,
    $modelo = null,
    $cod_poblacion = null,
    $modulos = null,
    $confidence = null,
    $orientacion = null,
    $cod_lista = null,
    $alertas = null,
    $cod_campaign = null,
    $cod_area = null,
    $tipo_area = null,
    $h24 = false
) {
    $bd = obtenerConexion();
    $seleccion = "";
    $agrupacion = "";
    $orden = "";
    $values = [];

    foreach ($campos as $campo => $valor) {
        ${$campo} = $valor;
        $valor = match ($valor) {
            "fecha" => "vr.fecha",
            "hora" => "hour(vr.hora) as hora",
            "cod_dispositivo", "dispositivo" => "vr.cod_dispositivo, d.coordenadas",
            "tipo_vh" => "vr.tipo_vh",
            "velocidad" => "ROUND(AVG(IFNULL(vr.velocidad_vehiculo, 0)), 2) as velocidad_media",
            "distintivo" => "vr.distintivo",
            "zona" => "ar.tipo_area",
            "pais" => "vr.pais",
            default => null
        };
        if (!$valor) continue;
        $seleccion .= $valor . ", ";
    }

    $where = "WHERE 1 ";
    $sql = "SELECT DISTINCT {$seleccion} COUNT(DISTINCT vr.cod_reconoc) as total 
	FROM {{.CORE}}.vehiculos_reconocidos vr
    LEFT JOIN {{.CORE}}.dispositivos d ON vr.cod_dispositivo = d.cod_dispositivo
	";
    if (in_array("zona", $campos)) {
        $sql .= " LEFT JOIN {{.CITY}}.dispositivo_area disp_ar ON disp_ar.cod_dispositivo = d.cod_dispositivo
        LEFT JOIN {{.CITY}}.area_restringida ar ON disp_ar.cod_area = disp_ar.cod_area ";
    }

    if ($h24 === true) {
        $where = "WHERE CONCAT(vr.fecha, ' ', vr.hora) >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ";
    } else if ($fecha_ini && $fecha_fin) {
        $where = "WHERE vr.fecha BETWEEN ? AND ? ";
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    }

    if (in_array("velocidad", $campos)) {
        $where .= "AND vr.velocidad_vehiculo > 0 ";
    }

    if ($modulos != null and !empty($modulos)) {
        $sql .= "LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON vr.cod_dispositivo = dm.cod_dispositivo ";

        $where .= "AND dm.estado_canal <> '" . ESTADOS_CANALES["ESTADO_CADUCADO"] . "' AND dm.cod_modulo IN (";
        for ($j = 0; $j < count($modulos); $j++) {
            $values[] = $modulos[$j];
            $where .= "?, ";
        }
        $where = rtrim($where, ", ");
        $where .= ") ";
    }

    if ($matricula != null) {
        $where .= "AND vr.matricula LIKE ? ";
        $values[] = "%$matricula%";
    }

    if ($color != null) {
        $where .= "AND vr.color LIKE ? ";
        $values[] = "%$color%";
    }

    if ($marca != null) {
        $where .= "AND vr.marca LIKE ? ";
        $values[] = "%$marca%";
    }

    if ($modelo != null) {
        $where .= "AND vr.modelo LIKE ? ";
        $values[] = "%$modelo%";
    }

    if ($tipo_vh != null)
        if (is_array($tipo_vh) && !empty($tipo_vh)) {
            $where .= "AND vr.tipo_vh IN (";
            for ($i = 0; $i < count($tipo_vh); $i++) {
                $where .= "?, ";
                $values[] = $tipo_vh[$i];
            }
            $where = rtrim($where, ", ") . ") ";
        } else {
            $where .= "AND vr.tipo_vh = ? ";
            $values[] = $tipo_vh;
        }

    if ($cod_provincia != null) {
        $where .= "AND vr.cod_provincia = ?";
        $values[] = $cod_provincia;
    }

    if ($hora_ini != null && $hora_fin != null) {
        $where .= "AND vr.hora BETWEEN ? AND ? ";
        $values[] = $hora_ini;
        $values[] = $hora_fin;
    }

    if ($pais != null) {
        $where .= "AND vr.pais = ? ";
        $values[] = $pais;
    }

    if ($cod_poblacion != null) {
        $where .= "AND vr.cod_poblacion = ? ";
        $values[] = $cod_poblacion;
    }

    if ($dispositivos != null) {
        if (is_array($dispositivos) && !empty($dispositivos)) {
            $where .= "AND vr.cod_dispositivo IN (?, ";
            $values[] = current($dispositivos);
            while (next($dispositivos) != null) {
                $where .= "?, ";
                $values[] = current($dispositivos);
            }
            $where = rtrim($where, ", ");
            $where .= ") ";
        }
    }

    if ($orientacion != null) {
        $where .= "AND vr.orientacion = ? ";
        $values[] = $orientacion;
    }

    if ($cod_lista != null) {
        $sql .= "LEFT JOIN {{.CITY}}.listas_vehiculos lv ON lv.matricula = vr.matricula ";
        $where .= "AND lv.cod_lista = ? ";
        $values[] = $cod_lista;
    }

    if ($cod_area != null || $tipo_area != null) {
        if (!in_array("zona", $campos)) {
            $sql .= " LEFT JOIN {{.CITY}}.dispositivo_area disp_ar ON disp_ar.cod_dispositivo = d.cod_dispositivo
                LEFT JOIN {{.CITY}}.area_restringida ar ON disp_ar.cod_area = disp_ar.cod_area ";
        }

        if ($cod_area) {
            $where .= "AND ar.cod_area = ? ";
            $values[] = $cod_area;
        }

        if ($tipo_area) {
            $where .= "AND ar.tipo_area = ? ";
            $values[] = $tipo_area;
        }
    }

    if ($cod_campaign != null) {
        $sql .=
            "RIGHT JOIN {{.CITY}}.campaign cpg
                ON FIND_IN_SET(vr.cod_dispositivo, REPLACE(cpg.dispositivos, ';', ',')) > 0 
                AND vr.fecha BETWEEN cpg.fecha_ini AND cpg.fecha_fin ";

        $where .= "AND cpg.cod_campaign = ? ";
        $values[] = $cod_campaign;
    }

    if ($alertas != null) {
        if (!empty($alertas)) {
            $sql .=
                "LEFT JOIN {{.CITY}}.alertas a ON a.cod_reconoc = vr.cod_reconoc 
				LEFT JOIN {{.CITY}}.alertas_gestion ag ON a.cod_alertagest = ag.cod_alertagest ";
            $where .= "AND ag.cod_alertagest IN (?, ";
            $values[] = current($alertas);

            while (next($alertas) != null) {
                $where .= "?, ";
                $values[] = current($alertas);
            }
            $where = rtrim($where, ", ");
            $where .= ") ";
        }
    }

    if ($confidence != null) {
        $menorMayor = substr($confidence, 0, 1);
        $expl = explode($menorMayor, $confidence);

        if ($menorMayor != "<" && $menorMayor != ">" && $menorMayor != "=") {
            $menorMayor = "=";
        } else {
            $confidence = implode($expl);
        }

        $where .= "AND vr.confidence " . $menorMayor . " ? ";
        $values[] = intval($confidence) / 100;
    }

    if ($velocidad_vehiculo != null) {
        $menorMayor = substr($velocidad_vehiculo, 0, 1);
        $expl = explode($menorMayor, $velocidad_vehiculo);

        if ($menorMayor != "<" && $menorMayor != ">" && $menorMayor != "=") {
            $menorMayor = "=";
        } else {
            $velocidad_vehiculo = implode($expl);
        }

        $where .= "AND vr.velocidad_vehiculo " . $menorMayor . " ? ";
        $values[] = intval($velocidad_vehiculo);
    }
    $sql .= $where;

    foreach ($campos as $campo => $valor) {
        ${$campo} = $valor;
        $valor = match ($valor) {
            "fecha" => "vr.fecha",
            "hora" => "hour(vr.hora)",
            "cod_dispositivo", "dispositivo" => "vr.cod_dispositivo",
            "tipo_vh" => "vr.tipo_vh",
            "distintivo" => "vr.distintivo",
            "zona" => "ar.tipo_area",
            "pais" => "vr.pais",
            default => null,
        };
        if (!$valor) continue;

        $agrupacion .= $valor . ", ";
    }

    $agrupacion = rtrim($agrupacion, ", ");  // elimina la última coma y espacio en blanco

    if ($agrupacion != "") {
        $sql .= "GROUP BY {$agrupacion} ";
    }

    if (in_array("zona", $campos)) {
        $sql .= "HAVING ar.tipo_area IS NOT NULL ";
    }

    // ORDER
    $orden = "";
    if (is_array($order) || is_object($order)) {
        foreach ($order as $ord => $valor) {
            ${$ord} = $valor;
            $orden .= $valor . ", ";
        }
    }

    if ($orden != "") {
        $orden = rtrim($orden, ", ");  // elimina la última coma y espacio en blanco
        $sql .= " ORDER BY " . $orden;
    }

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerReconocimientosMatricula(
    $matricula,
    $cod_dispositivo
) {
    $values = [];
    $sql = "SELECT vr.* FROM {{.CORE}}.vehiculos_reconocidos vr ";

    $where = "WHERE foto IS NOT NULL ";
    if ($matricula != null && !is_array($matricula)) {
        $where .= "AND vr.matricula LIKE ? ";
        $values[] = "%$matricula%";
    }

    if ($cod_dispositivo != null && !is_array($cod_dispositivo)) {
        $where .= "AND vr.cod_dispositivo = ? ";
        $values[] = $cod_dispositivo;
    }

    $where .= " ORDER BY fecha DESC, hora DESC ";

    $sql .= $where . "LIMIT 1";

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerReconocimientosAlertas24(
    $cod_dispositivo = null,
    $nom_dispositivo = null,
    $cod_alertagest = null,
    $nombre_lista = null,
    $modulos = null
) {
    $bd = obtenerConexion();
    $values = [];
    $cod_modulo_traffic = MODULOS["traffic"]["cod_modulo"];
    $sql = "SELECT DISTINCT vr.*, 
		(
			SELECT GROUP_CONCAT(DISTINCT a2.cod_alertagest SEPARATOR ';') 
			FROM {{.CITY}}.alertas a2
			RIGHT JOIN {{.CITY}}.alertas_gestion ag2 ON a2.cod_alertagest = ag2.cod_alertagest 
			WHERE a2.cod_reconoc = vr.cod_reconoc AND ag2.cod_modulo = {$cod_modulo_traffic}
		) AS cod_alertagest,
		GROUP_CONCAT(ag.nombre_alerta SEPARATOR ';') AS nombre_alerta, d.nom_dispositivo
	FROM {{.CORE}}.vehiculos_reconocidos vr 
	LEFT JOIN {{.CORE}}.dispositivos d ON vr.cod_dispositivo = d.cod_dispositivo 
	LEFT JOIN {{.CITY}}.alertas a ON a.cod_reconoc = vr.cod_reconoc
	LEFT JOIN {{.CITY}}.listas l ON FIND_IN_SET(a.cod_alertagest, REPLACE(l.tipo_alerta, ';', ',')) > 0
	RIGHT JOIN {{.CITY}}.alertas_gestion ag ON a.cod_alertagest = ag.cod_alertagest 
	";

    $where = "WHERE ag.cod_alertagest IS NOT NULL AND ag.cod_alertagest != 0 AND ag.cod_modulo = {$cod_modulo_traffic} ";
    $where .= "AND CONCAT(vr.fecha, ' ', vr.hora) >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ";

    if ($nombre_lista != null) {
        $where .= "AND l.nombre_lista LIKE ? ";
        $values[] = "%$nombre_lista%";
    }

    if ($cod_dispositivo != null) {
        $where .= "AND vr.cod_dispositivo = ? ";
        $values[] = $cod_dispositivo;
    }

    if ($nom_dispositivo != null) {
        $where .= "AND d.nom_dispositivo LIKE ? ";
        $values[] = "%$nom_dispositivo%";
    }

    if ($cod_alertagest != null) {
        if (is_array($cod_alertagest) && !empty($cod_alertagest)) {
            $where .= "AND ag.cod_alertagest IN (?, ";
            $values[] = current($cod_alertagest);

            while (next($cod_alertagest) != null) {
                $where .= "?, ";
                $values[] = current($cod_alertagest);
            }
            $where = rtrim($where, ", ");
            $where .= ") ";
        } else {
            $where .= "AND ag.cod_alertagest = ? ";
            $values[] = $cod_alertagest;
        }
    }

    if ($modulos != null and !empty($modulos)) {
        $sql .= "LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON vr.cod_dispositivo = dm.cod_dispositivo ";
        $where .= "AND dm.cod_modulo IN (";
        for ($i = 0; $i < count($modulos); $i++) {
            $values[] = $modulos[$i];
            $where .= "?, ";
        }
        $where = rtrim($where, ", ") . ") ";
    }

    $sql .= $where . "GROUP BY vr.cod_reconoc ORDER BY vr.fecha DESC, vr.hora DESC LIMIT 5000;";

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}
function obtenerReconocimientosDispositivoLimitGrid(
    $cod_usuario = null,
    $modulos = null,
) {
    $bd = obtenerConexion();
    $datos_config = obtenerConfigUsrGrid($cod_usuario);

    if (empty($datos_config)) {
        http_response_code(500);
        return [
            "message" => "No se han encontrado datos de usuario",
            "error" => true,
            "code" => 500
        ];
    }

    $grid1 = $datos_config[0]->grid1;

    if (!$grid1) {
        return [
            "message" => "No se han encontrado datos de grid para el usuario",
            "error" => true,
            "code" => 204
        ];
    }

    $grid = $grid1;

    $dispositivos = explode(";", $grid);

    $values = [];
    if ($modulos != null && !empty($modulos)) {
        $leftJoinModulos = "LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON dispositivos.cod_dispositivo = dm.cod_dispositivo ";

        $where = "AND dm.cod_modulo IN (";
        for ($i = 0; $i < count($modulos); $i++) {
            $values[] = $modulos[$i];
            $where .= "?, ";
        }
        $where = rtrim($where, ", ");
        $where .= ") ";
    } else {
        $where = "";
        $leftJoinModulos = "";
    }

    $sql = "SELECT * 
    FROM {{.CORE}}.vehiculos_reconocidos as vr 
    LEFT JOIN {{.CORE}}.dispositivos d ON vr.cod_dispositivo = d.cod_dispositivo
	$leftJoinModulos
	WHERE 1
	$where
	AND vr.cod_reconoc IN (
		SELECT MAX(vr2.cod_reconoc) 
		FROM {{.CORE}}.vehiculos_reconocidos vr2 ";
    $order_dispositivos = "ORDER BY FIELD (vr.cod_dispositivo, ";

    if (empty($dispositivos)) {
        return [];
    }

    $sql .= " WHERE (vr.cod_dispositivo = ?";
    $values[] = current($dispositivos);
    $order_dispositivos .= "'" . current($dispositivos) . "'";

    while (next($dispositivos) != null) {
        $sql .= " OR vr.cod_dispositivo = ?";
        $values[] = current($dispositivos);
        $order_dispositivos .= ", '" . current($dispositivos) . "'";
    }
    $order_dispositivos .= "), vr.fecha DESC, vr.hora DESC;";

    $sql .= ") GROUP BY vr.cod_dispositivo) $order_dispositivos";

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function existeReconocimiento($cod_reconoc)
{
    $bd = obtenerConexion();
    $values = [];
    $where = "WHERE vr.cod_reconoc = ? ";
    $values[] = $cod_reconoc;

    $sql = sprintf(
        "SELECT COUNT(*) as total 
        FROM {{.CORE}}.vehiculos_reconocidos vr
        %s",
        $where,
    );

    try {
        $rows = ejecutarConsultaSql($bd, $sql, $values, true);

        return count($rows) >= 1;
    } catch (PDOException $e) {
        errorAlObtenerDatos(__FUNCTION__, "obtener", $e);

        return false;
    }
}

function obtenerReconocimientoMarcado($cod_reconoc, $cod_usuario)
{
    $bd = obtenerConexion();
    $values = [];
    $where = "WHERE 1 ";

    if ($cod_reconoc != null) {
        $where .= "AND vrm.cod_reconoc = ? ";
        $values[] = $cod_reconoc;
    }

    if ($cod_usuario != null) {
        $where .= "AND vrm.cod_usuario = ? ";
        $values[] = $cod_usuario;
    }

    $sql = sprintf(
        "SELECT * 
        FROM {{.CORE}}.vehiculos_reconocidos_mark vrm 
        %s",
        $where,
    );

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function marcarReconocimiento($cod_reconoc, $cod_usuario)
{
    if (!($cod_reconoc && $cod_usuario)) {
        return [
            "message" => "Error al marcar reconocimiento: Parámetros inválidos",
            "error" => true,
        ];
    }

    if (!existeReconocimiento($cod_reconoc)) {
        return [
            "message" => "Error al marcar reconocimiento: No existe",
            "error" => true,
        ];
    }

    $recon = obtenerReconocimientoMarcado($cod_reconoc, $cod_usuario);
    if (isset($recon["error"])) {
        return $recon;
    }

    $nombre_tabla = "{{.CORE}}.vehiculos_reconocidos_mark";
    $bd = obtenerConexion();

    if (count($recon) >= 1) { // Está marcado, lo desmarcamos
        $recon = $recon[0];

        $datos_condicionales = [
            "cod_mark" => $recon->cod_mark,
        ];

        return [
            "action" => "unmark",
            "success" => eliminarDatosTabla(
                $bd,
                __FUNCTION__,
                $nombre_tabla,
                $datos_condicionales,
            ),
        ];
    } else { // Lo marcamos, porque no existe
        $datos_tabla = [
            "cod_reconoc" => $cod_reconoc,
            "cod_usuario" => $cod_usuario,
        ];

        return [
            "action" => "mark",
            "success" => insertarDatosTabla(
                $bd,
                __FUNCTION__,
                $nombre_tabla,
                $datos_tabla
            ),
        ];
    }
}

function comprobarMatricula($matricula)
{
    if ( // ESPAÑA
        preg_match("/^[0-9]{4}[^AEIOU]{3}$/i", $matricula)
        || preg_match("/^[A-Z]{1,3}[0-9]{4}[A-Z]{1}$/i", $matricula)
        || preg_match("/^[R|E|C|P|S|V|H|T]{1}[0-9]{4}[^AEIOU]{3}$/i", $matricula)
        || preg_match("/^(CD|CC|TA|OI)[0-9]{5,6}$/i", $matricula)
    ) {
        return true;
    } elseif ( // ANDORRA
        preg_match("/^[A-Z]{1}[0-9]{4}$/i", $matricula) || preg_match("/^(5[8-9]|[6-9]\d)\d{3}$/", $matricula) || preg_match("/^[A-Z]{1}\d{2}$/", $matricula)
        || preg_match("/^(MT)\d{4,5}$/i", $matricula) || preg_match("/^[A-Z]{1,2}[0-9]{3,4}$/i", $matricula) || preg_match("/^(CD|A)[0-9]{2}[A-Z]{1}$/i", $matricula) ||
        preg_match("/^[0-9]{4}$/", $matricula)
    ) {
        return true;
    } elseif ( // RESTO DE EUROPA
        preg_match("/^[A-Z]{2}\d{3}[A-Z]{2}$/i", $matricula)
        || preg_match("/^[A-Z]{4}\d{2}$/i", $matricula)
        || preg_match("/^[A-Z]{4}\d{2}$/i", $matricula) || preg_match("/^\d(-)[A-Z]{3}(-)\d{3}$/i", $matricula) || preg_match("/^\d{4}[A-Z]{2}(-)\d{1}$/i", $matricula)
        || preg_match("/^[A-Z]{1}\d{2}(-)[A-Z]{1}(-)\d{3}$/i", $matricula) || preg_match("/^[A-Z]{2}\d{4}[A-Z]{2}$/i", $matricula) || preg_match("/^[A-Z]{3}\d{3}$/i", $matricula)
        || preg_match("/^[A-Z]{2}\d{3}(-)[A-Z]{2}$/i", $matricula) || preg_match("/^[A-Z]{2}\d{5}$/i", $matricula) || preg_match("/^[A-Z]{2}\d{3}[A-Z]{2}$/i", $matricula)
        || preg_match("/^[A-Z]{4}(-)\d{3}$/i", $matricula) || preg_match("/^\d{3}[A-Z]{3}$/i", $matricula) || preg_match("/^[A-Z]{3}(-)\d{3}$/i", $matricula)
        || preg_match("/^[A-Z]{2}(-)\d{3}(-)[A-Z]{2}$/i", $matricula) || preg_match("/^[A-Z]{3}(-)\d{4}$/i", $matricula) || preg_match("/^d{1}(-)[A-Z]{3}(-)\d{2}$/i", $matricula)
        || preg_match("/^[A-Z]{4}(-)\d{3}$/i", $matricula) || preg_match("/^\d{2}[A-Z]{2}\d{5}$/i", $matricula) || preg_match("/^[A-Z]{2}\d{3}[A-Z]{2}$/i", $matricula)
        || preg_match("/^[A-Z]{2}(-)\d{4}$/i", $matricula) || preg_match("/^[A-Z]{3}\d{3}$/i", $matricula) || preg_match("/^[A-Z]{2}\d{4}$/i", $matricula)
        || preg_match("/^[A-Z]{2}\d{4}[A-Z]{2}$/i", $matricula) || preg_match("/^[A-Z]{3}\d{3}$/i", $matricula) || preg_match("/^\d{4}$/", $matricula)
        || preg_match("/^[A-Z]{4}\d{3}$/i", $matricula) || preg_match("/^[A-Z]{2}\d{5}$/i", $matricula) || preg_match("/^[A-Z]{2}\d{2}[A-Z]{2}$/i", $matricula)
        || preg_match("/^[A-Z]{1}\d{2}[A-Z]{3}$/i", $matricula) || preg_match("/^\d{1}[A-Z]{2}\d{4}$/i", $matricula) || preg_match("/^[A-Z]{2}\d{2}[A-Z]{3}$/i", $matricula)
        || preg_match("/^[A-Z]{1}\d{3}[A-Z]{2}\d{2}$/i", $matricula) || preg_match("/^[A-Z]{1}\d{4}$/i", $matricula) || preg_match("/^[A-Z]{2}\d{3}(-)[A-Z]{2}$/i", $matricula)
        || preg_match("/^[A-Z]{3}\d{2}[A-Z]{1}$/i", $matricula) || preg_match("/^[A-Z]{2}(-)\d{6}$/i", $matricula) || preg_match("/^[A-Z]{2}\d{4}[A-Z]{2}$/i", $matricula)
        || preg_match("/^[A-Z]{3}\d{5}$/i", $matricula)
    ) {
        return true;
    } else {
        return false;
    }
}

/**
 * Obtiene reconocimientos históricos de una matrícula para notificaciones
 * 
 * @param string $matricula Matrícula del vehículo
 * @param int $dias Número de días hacia atrás (default: 30)
 * @param int|null $limit Límite de resultados
 * @return array Lista de reconocimientos con información del dispositivo
 */
function obtenerReconocimientosMatriculaHistorico(
    $matricula,
    $dias = null,
    $limit = null
) {
    if (!$matricula) {
        return [];
    }

    $bd = obtenerConexion();
    $values = [$matricula];

    $where = "";
    if ($dias != null) {
        $where .= "AND vr.fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY) ";
        $values[] = $dias;
    }

    $sql = "SELECT 
        vr.cod_reconoc,
        vr.matricula,
        vr.fecha,
        vr.hora,
        vr.pais,
        vr.confidence,
        vr.foto,
        vr.fotop,
        vr.marca,
        vr.modelo,
        vr.color,
        vr.tipo_vh,
        vr.velocidad_vehiculo,
        vr.orientacion,
        vr.latitud,
        vr.longitud,
        vr.cod_dispositivo,
        d.nom_dispositivo
    FROM 
        {{.CORE}}.vehiculos_reconocidos vr
    LEFT JOIN 
        {{.CORE}}.dispositivos d ON vr.cod_dispositivo = d.cod_dispositivo
    WHERE 
        vr.matricula = ?
        {$where}
    ORDER BY 
        vr.fecha DESC, vr.hora DESC";

    if ($limit !== null && $limit > 0) {
        $sql .= " LIMIT ?";
        $values[] = $limit;
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}
