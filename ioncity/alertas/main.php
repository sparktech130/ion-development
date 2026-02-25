<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/reconocimientos/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/analisis/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/infracciones/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/areas/main.php";

// ===== Alertas Gestión =====
function insertarAlertaGestion(
    $nombre_alerta = null, 
    $desc_alerta = null, 
    $tipo_alerta = null, 
    $destinatarios_mail = null, 
    $destinatarios_sms = null, 
    $destinatarios_llamada = null, 
    $cod_provincia = null, 
    $cod_poblacion = null,
    $cod_modulo = null,
) {
    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.alertas_gestion";
    $datos_tabla = [
        "nombre_alerta" => $nombre_alerta, 
        "desc_alerta" => $desc_alerta, 
        "tipo_alerta" => $tipo_alerta, 
        "destinatarios_mail" => $destinatarios_mail, 
        "destinatarios_sms" => $destinatarios_sms, 
        "destinatarios_llamada" => $destinatarios_llamada, 
        "cod_provincia" => $cod_provincia, 
        "cod_poblacion" => $cod_poblacion, 
        "cod_modulo" => $cod_modulo,
    ];

    $insert = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, true);
    return $insert;
}

function obtenerAlertasGestionParam(
    $cod_alertagest = null, 
    $nombre_alerta = null, 
    $tipos_alertas = null,
    $cod_modulo = null,
) {
    $bd = obtenerConexion();
    $sql = "SELECT ag.*, m.nombre_modulo
    FROM {{.CITY}}.alertas_gestion ag 
    LEFT JOIN {{.CORE}}.modulos m ON ag.cod_modulo = m.cod_modulo
    WHERE 1 ";
    $values = [];

    if ($cod_alertagest != null) {
        $sql .= "AND ag.cod_alertagest = ? ";
        $values[] = $cod_alertagest;
    }

    if ($nombre_alerta != null) {
        $sql .= "AND ag.nombre_alerta LIKE ? ";
        $values[] = "%$nombre_alerta%";
    }

    if (!empty($tipos_alertas)) {
        $tipo_alerta = current($tipos_alertas);
        $sql .= "AND (ag.tipo_alerta LIKE ? ";
        $values[] = "%$tipo_alerta%";

        while (next($tipos_alertas) != null) {
            $tipo_alerta = current($tipos_alertas);
            $sql .= "OR ag.tipo_alerta LIKE ? ";
            $values[] = "%$tipo_alerta%";
        }
        $sql .= ")";
    }

    if ($cod_modulo != null) {
        $sql .= "AND ag.cod_modulo = ? ";
        $values[] = $cod_modulo;
    }

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}
function modificarAlertaGestion(
    $cod_alertagest, 
    $campos,
) {
    if (!$cod_alertagest) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.alertas_gestion";
    $datos_tabla = [
        "nombre_alerta" => $campos->nombre_alerta, 
        "desc_alerta" => $campos->desc_alerta, 
        "tipo_alerta" => $campos->tipo_alerta, 
        "destinatarios_mail" => $campos->destinatarios_mail, 
        "destinatarios_sms" => $campos->destinatarios_sms, 
        "destinatarios_llamada" => $campos->destinatarios_llamada, 
        "cod_modulo" => $campos->cod_modulo, 
    ];
    $datos_condicionales = [
        "cod_alertagest" => $cod_alertagest,
    ];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

function eliminarAlertasGestion($alertas) {
    $bd = obtenerConexion();
    if (count($alertas) <= 0) {
        return errorAlObtenerDatos(__FUNCTION__, 'delete');
    }

    $values = [];
    foreach ($alertas as $val) {
        $values[] = $val->id;
    }

    $nombre_tabla = "{{.CITY}}.alertas_gestion";
    $datos_condicionales = [
        "cod_alertagest" => $values,
    ];

    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

// ===== Alertas =====
function insertarAlerta(
    $cod_reconoc = null,
    $matricula = null,
    $incidencia = null,
    $cod_dispositivo = null,
    $fecha = null,
    $hora = null,
    $estat = null,
    $usuario = null,
    $f_modif = null,
    $imagen = null,
    $cod_alertagest = null,
    $zoneId = null,
    $cod_area = null,
    $velocidad_max = null,
    $cod_campaign = null,
) {
    $nombre_tabla = '{{.CITY}}.alertas';
    $datos_tabla = [
        'cod_reconoc' => $cod_reconoc,
        'matricula' => $matricula,
        'incidencia' => $incidencia,
        'cod_dispositivo' => $cod_dispositivo,
        'fecha' => $fecha,
        'hora' => $hora,
        'estat' => $estat,
        'usuario' => $usuario,
        'f_modif' => $f_modif,
        'imagen' => $imagen,
        'cod_alertagest' => $cod_alertagest,
        'zoneId' => $zoneId,
        'cod_area' => $cod_area,
        'velocidad_max' => $velocidad_max,
        'cod_campaign' => $cod_campaign
    ];

    $bd = obtenerConexion();
    $cod_alerta = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, true);
    return $cod_alerta;
}

function modificarAlertas(
    $cod_alerta = null, 
    $cod_reconoc = null, 
    $matricula = null, 
    $incidencia = null, 
    $cod_dispositivo = null, 
    $fecha = null, 
    $hora = null, 
    $estat = null, 
    $usuario = null,
    $motivo = null,
) {
    if ($cod_alerta == null) {
        return false;
    }
    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.alertas";
    $datos_tabla = [
        "cod_reconoc" => $cod_reconoc,
        "matricula" => $matricula,
        "incidencia" => $incidencia,
        "cod_dispositivo" => $cod_dispositivo,
        "fecha" => $fecha,
        "hora" => $hora,
        "estat" => $estat,
        "motivo" => $motivo,
        "usuario" => $usuario,
    ];
    $datos_condicionales = [
        "cod_alerta" => $cod_alerta,
    ];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

function modificarAlertaReconocimiento($cod_reconoc, $cod_alertagest) {
    if (!$cod_reconoc || !$cod_alertagest) {
        return false;
    }

    $reconocimiento = obtenerReconocimientos(cod_reconoc: $cod_reconoc)[0] ?? null;

    if (empty($reconocimiento) || $reconocimiento === null) {
        return false;
    }

    $alertagest = '';
    if (isset($reconocimiento->cod_alertagest)) {
        $alertagest = "{$reconocimiento->cod_alertagest}";
    }

    $alertagest = explode(';', $alertagest);
    if (array_search($cod_alertagest, $alertagest) !== false) {
        return false;
    }

    $alertagest[] = $cod_alertagest;
    $alertagest = implode(';', $alertagest);

    return modificarReconocimientos($cod_reconoc, $alertagest, null);
}


function validarAlertas($cod_alerta, $f_modif) {
    if ($cod_alerta == null) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.alertas";
    $datos_tabla = [
        "estat" => 'v',
        "f_modif" => $f_modif,
    ];
    $datos_condicionales = [
        "cod_alerta" => $cod_alerta,
    ];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

function eliminarAlerta($cod_alerta) {
    if ($cod_alerta == null) {
        return false;
    }

    $nombre_tabla = "{{.CITY}}.alertas";
    $datos_condicionales = [
        "cod_alerta" => $cod_alerta,
    ];

    $bd = obtenerConexion();
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function obtenerAlertas($cod_alerta = null) {
    $values = [];
    $sql = "SELECT DISTINCT
		a.cod_alerta, a.estat, a.cod_reconoc, a.zoneId,
		d.*,
        a.cod_area,
		ag.cod_alertagest, IFNULL(ag.nombre_alerta, a.incidencia) as nombre_alerta,
        vr.matricula, vr.fecha, vr.hora, IFNULL(vr.foto, a.imagen) as foto, vr.fotop, 
        vr.marca, vr.modelo, vr.color, vr.tipo_vh, vr.distintivo, vr.velocidad_vehiculo,
		vr.pais, vr.confidence, vr.fecha_modif,
		CONCAT(a.fecha, ' ', a.hora) as fecha_hora,
        a.velocidad_max
	FROM {{.CITY}}.alertas a 
	LEFT JOIN {{.CORE}}.vehiculos_reconocidos vr ON vr.cod_reconoc = a.cod_reconoc 
	LEFT JOIN {{.CITY}}.alertas_gestion ag ON a.cod_alertagest = ag.cod_alertagest
	INNER JOIN {{.CORE}}.dispositivos d ON a.cod_dispositivo = d.cod_dispositivo 
	WHERE a.cod_alertagest IS NOT NULL ";

    if ($cod_alerta != null) {
        $sql .= 'AND a.cod_alerta = ? ';
        $values[] = $cod_alerta;
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerAlertasParam(
    $cod_alerta = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $hora_ini = null,
    $hora_fin = null,
    $matricula = null,
    $pais = null,
    $marca = null,
    $modelo = null,
    $color = null,
    $cod_dispositivo = null,
    $nom_dispositivo = null,
    $orientacion = null,
    $confidence = null,
    $alertas = null,
    $limit = null,
    $modulos = null,
    $tipo_vh = null,
    $velocidad_vehiculo = null,
    $nombre_lista = null,
    $cod_area = null,
    $cod_campaign = null,
    $h24 = false,
) {
    $values = [];
    $sql = "SELECT DISTINCT 
        v.*, 
        a.*, 
        cpg.nombre_campaign, 
        a.cod_alertagest, 
        d.cod_dispositivo, d.nom_dispositivo, d.deviceId, d.coordenadas, 
        d.cod_area, d.direccion,
        (CASE 
            WHEN a.cod_alertagest = '0001' THEN IFNULL(a.velocidad_max, dv.velocidad_max)
            ELSE NULL
        END) as velocidad_max
	FROM {{.CITY}}.alertas a 
	LEFT JOIN {{.CITY}}.campaign cpg ON cpg.cod_campaign = a.cod_campaign
	LEFT JOIN {{.CORE}}.vehiculos_reconocidos v ON v.cod_reconoc = a.cod_reconoc 
	LEFT JOIN {{.CITY}}.alertas_gestion ag ON a.cod_alertagest = ag.cod_alertagest
	INNER JOIN {{.CORE}}.dispositivos d ON a.cod_dispositivo = d.cod_dispositivo 
    LEFT JOIN {{.CITY}}.dispositivos_velocidades dv ON dv.cod_dispositivo = d.cod_dispositivo 
	LEFT JOIN {{.CITY}}.listas_vehiculos lv ON lv.matricula = a.matricula 
	LEFT JOIN {{.CITY}}.listas l ON lv.cod_lista = l.cod_lista ";

    $where = 'WHERE a.cod_alertagest IS NOT NULL ';
    if ($h24 === true) {
        $where .= "AND CONCAT(a.fecha, ' ', a.hora) >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ";
    } else {
        if ($fecha_ini != null && $fecha_fin != null) {
            $where .= 'AND a.fecha BETWEEN ? AND ? ';
            $values[] = $fecha_ini;
            $values[] = $fecha_fin;
        }
    }

    if ($cod_alerta != null) {
        $where .= 'AND a.cod_alerta = ? ';
        $values[] = "$cod_alerta";
    }

    if ($hora_ini != null && $hora_fin != null) {
        $where .= 'AND a.hora BETWEEN ? AND ? ';
        $values[] = $hora_ini;
        $values[] = $hora_fin;
    }

    if ($matricula != null) {
        $where .= 'AND a.matricula LIKE ? ';
        $values[] = "%$matricula%";
    }

    if ($pais != null) {
        $where .= 'AND v.pais = ? ';
        $values[] = $pais;
    }

    if ($marca != null) {
        $where .= 'AND v.marca LIKE ? ';
        $values[] = "%$marca%";
    }

    if ($modelo != null) {
        $where .= 'AND v.modelo LIKE ? ';
        $values[] = "%$modelo%";
    }

    if ($color != null) {
        $where .= 'AND v.color LIKE ? ';
        $values[] = "%$color%";
    }

    if ($cod_dispositivo != null) {
        $where .= 'AND d.cod_dispositivo = ? ';
        $values[] = $cod_dispositivo;
    }

    if ($nom_dispositivo != null) {
        $where .= 'AND d.nom_dispositivo LIKE ? ';
        $values[] = "%$nom_dispositivo%";
    }

    if ($orientacion != null) {
        $where .= 'AND v.orientacion = ? ';
        $values[] = $orientacion;
    }

    if ($tipo_vh != null) {
        $where .= 'AND v.tipo_vh = ? ';
        $values[] = $tipo_vh;
    }

    if ($nombre_lista != null) {
        $where .= 'AND l.nombre_lista LIKE ? ';
        $values[] = "%$nombre_lista%";
    }

    if ($cod_area != null) {
        $sql .= "LEFT JOIN {{.CITY}}.area_restringida ar ON FIND_IN_SET(ar.cod_area, REPLACE(d.cod_area, ';', ',')) > 0 ";

		$where .= "AND ar.cod_area = ? ";
		$values[] = $cod_area;
	}

    if ($confidence != null) {
        $menorMayor = substr($confidence, 0, 1);
        $expl = explode($menorMayor, $confidence);

        if ($menorMayor != '<' && $menorMayor != '>' && $menorMayor != '=') {
            $menorMayor = '=';
        } else {
            $confidence = implode($expl);
        }

        $where .= 'AND v.confidence ' . $menorMayor . ' ? ';
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

        $where .= 'AND v.velocidad_vehiculo ' . $menorMayor . ' ? ';
        $values[] = intval($velocidad_vehiculo);
    }

    if ($alertas != null) {
        if (!empty($alertas)) {
            $where .= 'AND ag.cod_alertagest IN (?, ';
            $values[] = current($alertas);

            while (next($alertas) != null) {
                $where .= '?, ';
                $values[] = current($alertas);
            }
            $where = rtrim($where, ', ');
            $where .= ') ';
        }
    }

    if ($cod_campaign != null) {
        $where .= 'AND cpg.cod_campaign = ? ';
        $values[] = $cod_campaign;
    }

    if ($modulos != null and !empty($modulos)) {
        $sql .= 'LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON v.cod_dispositivo = dm.cod_dispositivo ';
        $where .= "AND dm.estado_canal <> '" . ESTADOS_CANALES['ESTADO_CADUCADO'] . "' ";
        $condiciones = [
            "AND dm.cod_modulo IN (",
            "AND ag.cod_modulo IN ("
        ];
        foreach ($condiciones as $c) {
            $where .= $c;
            for ($i = 0; $i < count($modulos); $i++) {
                $values[] = $modulos[$i];
                $where .= '?, ';
            }
            $where = rtrim($where, ', ') . ') ';
        }
    }

    $sql .= "$where ORDER BY a.fecha DESC, a.hora DESC";

    if ($limit != null) {
        $sql .= ' LIMIT ?';
        $values[] = $limit;
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerAlertasGroupBy(
    $campos = null,
    $incidencia = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $estat = null,
    $limit = null,
    $modulos = null,
    $dispositivos = null,
    $order = null,
    $h24 = false
) {
    $bd = obtenerConexion();
    $seleccion = '';
    $agrupacion = '';
    $orden = '';
    $values = [];

    foreach ($campos as $campo => $valor) {
        ${$campo} = $valor;
        if ($valor == 'fecha') {
            $valor = 'a.fecha';
        } else if ($valor == 'hora') {
            $valor = 'hour(a.hora) as hora';
        } else if ($valor == 'cod_dispositivo') {
            $valor = 'a.cod_dispositivo';
        } else if ($valor == 'cod_alertagest') {
            $valor = 'ag.cod_alertagest';
        }
        $seleccion .= $valor . ', ';
    }

    $seleccion = rtrim($seleccion, ', ');

    $sql = "SELECT $seleccion, COUNT(a.cod_alerta) as total 
	FROM {{.CITY}}.alertas a
    LEFT JOIN {{.CITY}}.alertas_gestion ag ON a.cod_alertagest = ag.cod_alertagest
	";
    $where = 'WHERE 1 ';
    if ($h24 === true) {
        $where .= "AND CONCAT(a.fecha, ' ', hour(a.hora)) >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ";
    }

    if ($modulos != null and !empty($modulos)) {
        $sql .= 'LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON a.cod_dispositivo = dm.cod_dispositivo ';

        $where .= "AND dm.estado_canal <> '" . ESTADOS_CANALES['ESTADO_CADUCADO'] . "' ";
        $condiciones = [
            "AND dm.cod_modulo IN (",
            "AND ag.cod_modulo IN ("
        ];
        foreach ($condiciones as $c) {
            $where .= $c;
            for ($i = 0; $i < count($modulos); $i++) {
                $values[] = $modulos[$i];
                $where .= '?, ';
            }
            $where = rtrim($where, ', ') . ') ';
        }
    }

    if ($fecha_ini != null and $fecha_fin != null) {
        $where .= 'AND a.fecha between ? AND ? ';
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    }

    if ($incidencia != null) {
        $where .= 'AND a.incidencia like ? ';
        $values[] = "%$incidencia%";
    }

    if ($estat != null) {
        $where .= 'AND a.estat = ? ';
        $values[] = "$estat";
    }

    if (
        $dispositivos != null &&
            is_array($dispositivos) &&
            !empty($dispositivos)
    ) {
        $where .= 'AND a.cod_dispositivo IN (?, ';
        $values[] = current($dispositivos);
        while (next($dispositivos) != null) {
            $where .= '?, ';
            $values[] = current($dispositivos);
        }
        $where = rtrim($where, ', ');
        $where .= ') ';
    }

    foreach ($campos as $campo => $valor) {
        ${$campo} = $valor;
        if ($valor == 'fecha') {
            $valor = 'a.fecha';
        } else if ($valor == 'hora') {
            $valor = 'hour(a.hora)';
        } else if ($valor == 'cod_dispositivo') {
            $valor = 'a.cod_dispositivo';
        } else if ($valor == 'cod_alertagest') {
            $valor = 'ag.cod_alertagest';
        }

        $agrupacion .= $valor . ', ';
    }

    $agrupacion = rtrim($agrupacion, ', ');  // elimina la última coma y espacio en blanco

    $sql .= " $where GROUP BY $agrupacion ";

    $orden = '';
    foreach ($order as $ord => $valor) {
        ${$ord} = $valor;
        $orden .= $valor . ', ';
    }

    if ($orden != '') {
        $orden = rtrim($orden, ', ');  // elimina la última coma y espacio en blanco
        $sql .= ' ORDER BY ' . $orden;
    }

    if ($limit != null) {
        $sql .= ' LIMIT ?';
        $values[] = $limit;
    }

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerAlertasGeneral($cod_alerta = null) {
    $bd = obtenerConexion();
    $values = [];
    $sql = "SELECT 
		a.cod_alerta, a.estat, a.cod_reconoc,
		d.*,
		ag.cod_alertagest, IFNULL(ag.nombre_alerta, a.incidencia) as nombre_alerta,
        vr.matricula, vr.fecha, vr.hora, IFNULL(vr.foto, a.imagen) as foto, vr.fotop, 
        vr.marca, vr.modelo, vr.color, vr.tipo_vh, vr.distintivo, vr.velocidad_vehiculo,
		vr.pais, vr.confidence, vr.fecha_modif,
		CONCAT(a.fecha, ' ', a.hora) as fecha_hora, ag.cod_modulo, m.nombre_modulo as modulo
	FROM {{.CITY}}.alertas a 
	LEFT JOIN {{.CORE}}.dispositivos d on a.cod_dispositivo = d.cod_dispositivo
	LEFT JOIN {{.CORE}}.vehiculos_reconocidos vr on a.cod_reconoc = vr.cod_reconoc
	LEFT JOIN {{.CITY}}.alertas_gestion ag on ag.cod_alertagest = a.cod_alertagest
	LEFT JOIN {{.CORE}}.modulos m on ag.cod_modulo = m.cod_modulo
	WHERE 1 ";

    if ($cod_alerta != null) {
        $sql .= 'AND cod_alerta = ? ';
        $values[] = $cod_alerta;
    }

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerAlertasPdtes(
    $cod_alerta = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $hora_ini = null,
    $hora_fin = null,
    $matricula = null,
    $pais = null,
    $marca = null,
    $modelo = null,
    $color = null,
    $cod_dispositivo = null,
    $nom_dispositivo = null,
    $orientacion = null,
    $confidence = null,
    $alertas = null,
    $limit = null,
    $modulos = null,
    $tipo_vh = null,
    $velocidad_vehiculo = null,
    $nombre_lista = null,
    $cod_area = null,
    $h24 = false,
) {
    $bd = obtenerConexion();
    $values = [];

    $sql = 
    "SELECT DISTINCT
        v.*, 
        a.*, 
        cpg.nombre_campaign, 
        a.cod_alertagest, 
        d.cod_dispositivo, d.nom_dispositivo, d.deviceId, d.coordenadas, 
        d.cod_area,
        (CASE 
            WHEN a.cod_alertagest = '0001' THEN IFNULL(a.velocidad_max, dv.velocidad_max)
            ELSE NULL
        END) as velocidad_max
	FROM {{.CITY}}.alertas a 
	LEFT JOIN {{.CITY}}.campaign cpg ON cpg.cod_campaign = a.cod_campaign
	LEFT JOIN {{.CORE}}.vehiculos_reconocidos v ON v.cod_reconoc = a.cod_reconoc 
	LEFT JOIN {{.CITY}}.alertas_gestion ag ON a.cod_alertagest = ag.cod_alertagest
	INNER JOIN {{.CORE}}.dispositivos d ON a.cod_dispositivo = d.cod_dispositivo 
    LEFT JOIN {{.CITY}}.dispositivos_velocidades dv ON dv.cod_dispositivo = d.cod_dispositivo 
	LEFT JOIN {{.CITY}}.listas_vehiculos lv ON lv.matricula = a.matricula 
	LEFT JOIN {{.CITY}}.listas l ON lv.cod_lista = l.cod_lista ";

    $where = "WHERE a.estat = 'p' 
        AND a.cod_alertagest IS NOT NULL ";

    if ($h24 === true) {
        $where .= "AND CONCAT(a.fecha, ' ', a.hora) >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ";
    } else {
        if ($fecha_ini != null && $fecha_fin != null) {
            $where .= 'AND a.fecha BETWEEN ? AND ? ';
            $values[] = $fecha_ini;
            $values[] = $fecha_fin;
        }
    }

    if ($cod_alerta != null) {
        $where .= 'AND a.cod_alerta = ? ';
        $values[] = "$cod_alerta";
    }

    if ($hora_ini != null && $hora_fin != null) {
        $where .= 'AND a.hora BETWEEN ? AND ? ';
        $values[] = $hora_ini;
        $values[] = $hora_fin;
    }

    if ($matricula != null) {
        $where .= 'AND a.matricula LIKE ? ';
        $values[] = "%$matricula%";
    }

    if ($pais != null) {
        $where .= 'AND v.pais = ? ';
        $values[] = $pais;
    }

    if ($marca != null) {
        $where .= 'AND v.marca LIKE ? ';
        $values[] = "%$marca%";
    }

    if ($modelo != null) {
        $where .= 'AND v.modelo LIKE ? ';
        $values[] = "%$modelo%";
    }

    if ($color != null) {
        $where .= 'AND v.color LIKE ? ';
        $values[] = "%$color%";
    }

    if ($cod_dispositivo != null) {
        $where .= 'AND d.cod_dispositivo = ? ';
        $values[] = $cod_dispositivo;
    }

    if ($nom_dispositivo != null) {
        $where .= 'AND d.nom_dispositivo LIKE ? ';
        $values[] = "%$nom_dispositivo%";
    }

    if ($orientacion != null) {
        $where .= 'AND v.orientacion = ? ';
        $values[] = $orientacion;
    }

    if ($tipo_vh != null) {
        $where .= 'AND v.tipo_vh = ? ';
        $values[] = $tipo_vh;
    }

    if ($nombre_lista != null) {
        $where .= 'AND l.nombre_lista LIKE ? ';
        $values[] = "%$nombre_lista%";
    }

    if ($cod_area != null) {
        $sql .= "LEFT JOIN {{.CITY}}.area_restringida ar ON FIND_IN_SET(ar.cod_area, REPLACE(d.cod_area, ';', ',')) > 0 ";

		$where .= "AND ar.cod_area = ? ";
		$values[] = $cod_area;
	}

    if ($confidence != null) {
        $menorMayor = substr($confidence, 0, 1);
        $expl = explode($menorMayor, $confidence);

        if ($menorMayor != '<' && $menorMayor != '>' && $menorMayor != '=') {
            $menorMayor = '=';
        } else {
            $confidence = implode($expl);
        }

        $where .= 'AND v.confidence ' . $menorMayor . ' ? ';
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

        $where .= 'AND v.velocidad_vehiculo ' . $menorMayor . ' ? ';
        $values[] = intval($velocidad_vehiculo);
    }

    if ($alertas != null) {
        if (!empty($alertas)) {
            $where .= 'AND ag.cod_alertagest IN (?, ';
            $values[] = current($alertas);

            while (next($alertas) != null) {
                $where .= '?, ';
                $values[] = current($alertas);
            }
            $where = rtrim($where, ', ');
            $where .= ') ';
        }
    }

    if ($modulos != null and !empty($modulos)) {
        $sql .= 'LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON a.cod_dispositivo = dm.cod_dispositivo ';

        $where .= "AND dm.estado_canal <> '" . ESTADOS_CANALES['ESTADO_CADUCADO'] . "' ";
        $condiciones = [
            "AND dm.cod_modulo IN (",
            "AND ag.cod_modulo IN ("
        ];
        foreach ($condiciones as $c) {
            $where .= $c;
            for ($i = 0; $i < count($modulos); $i++) {
                $values[] = $modulos[$i];
                $where .= '?, ';
            }
            $where = rtrim($where, ', ') . ') ';
        }
    }

    $sql .= "$where ORDER BY a.fecha DESC, a.hora DESC";

    if ($limit != null) {
        $sql .= ' LIMIT ?';
        $values[] = $limit;
    }

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerUltimaAlertaDispositivos(
    $cod_alertagest,
    $modulos = null,
) {
    $bd = obtenerConexion();
    $alerta_vehiculo_robado = 'Vehículo robado';
    $values = ['p', $alerta_vehiculo_robado, $alerta_vehiculo_robado];
    $where = '';
    $cond = "";

    if ($cod_alertagest != null) {
        $where = 'AND a.cod_alertagest = ? ';
        $values[] = $cod_alertagest;
    }

    if ($modulos != null and !empty($modulos)) {
        $cond .= 'LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON vr.cod_dispositivo = dm.cod_dispositivo ';
        $where .= "AND dm.estado_canal <> '" . ESTADOS_CANALES['ESTADO_CADUCADO'] . "' ";
        $condiciones = [
            "AND dm.cod_modulo IN (",
            "AND ag.cod_modulo IN ("
        ];
        foreach ($condiciones as $c) {
            $where .= $c;
            for ($i = 0; $i < count($modulos); $i++) {
                $values[] = $modulos[$i];
                $where .= '?, ';
            }
            $where = rtrim($where, ', ') . ') ';
        }
    }

    $sql = 
        "SELECT 
            ranked.*, d.nom_dispositivo, d.cod_dispositivo, d.coordenadas
        FROM (
            SELECT  
                d.cod_dispositivo,
                a.cod_alerta, a.cod_reconoc,
                ag.cod_alertagest, IFNULL(ag.nombre_alerta, a.incidencia) as nombre_alerta,
                vr.matricula, IFNULL(vr.foto, a.imagen) as foto, vr.marca, vr.modelo, vr.tipo_vh,
                CONCAT(a.fecha, ' ', a.hora) as fecha_hora, 
                ROW_NUMBER() OVER (PARTITION BY d.cod_dispositivo ORDER BY vr.fecha DESC, vr.hora DESC) AS rn
            FROM {{.CITY}}.alertas a
            LEFT JOIN {{.CORE}}.dispositivos d on a.cod_dispositivo = d.cod_dispositivo
            LEFT JOIN {{.CORE}}.vehiculos_reconocidos vr on a.cod_reconoc = vr.cod_reconoc
            LEFT JOIN {{.CITY}}.alertas_gestion ag on ag.cod_alertagest = a.cod_alertagest
            {$cond}
            WHERE CONCAT(a.fecha, ' ', a.hora) >= DATE_SUB(NOW(), INTERVAL 24 HOUR) 
            AND a.cod_alertagest IS NOT NULL
            AND a.estat = ? 
            AND (ag.nombre_alerta != ? OR a.incidencia != ?)
            $where
            ORDER BY fecha_hora DESC
        ) AS ranked
        LEFT JOIN {{.CORE}}.dispositivos d ON d.cod_dispositivo = ranked.cod_dispositivo
        WHERE rn = 1
        ORDER BY fecha_hora DESC";

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

