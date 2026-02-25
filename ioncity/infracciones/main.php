<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/main.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/ftp.php";

// ===== Infracciones =====
function insertarInfraccion(
    $cod_infraccion = null,
    $desc_infraccion = null,
    $importe_infraccion = null,
    $importe_reducido = null,
    $puntos = null,
    $cod_modulo = null,
) {
    $nombre_tabla = '{{.CITY}}.infracciones';
    $datos_tabla = [
        'cod_infraccion' => $cod_infraccion,
        'desc_infraccion' => $desc_infraccion,
        'importe_infraccion' => $importe_infraccion,
        'importe_reducido' => $importe_reducido,
        'puntos' => $puntos,
        'cod_modulo' => $cod_modulo,
    ];

    $bd = obtenerConexion();
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla);
}

function importarInfracciones($archivo_csv, $cod_modulo) {
    // Lee el encabezado del archivo CSV
    $header = fgetcsv($archivo_csv);

    // Índices de los campos necesarios
    $cod_infraccion_index = array_search('cod_infraccion', $header);
    $desc_infraccion_index = array_search('desc_infraccion', $header);
    $importe_infraccion_index = array_search('importe_infraccion', $header);
    $importe_reducido_index = array_search('importe_reducido', $header);
    $puntos_index = array_search('puntos', $header);

    $infraccionesInsert = [];
    $infraccionesFail = [];

    // Filas del archivo CSV
    while (($row = fgetcsv($archivo_csv)) !== false) {
        $cod_infraccion = $row[$cod_infraccion_index];
        $desc_infraccion = $row[$desc_infraccion_index];
        $importe_infraccion = $row[$importe_infraccion_index];
        $importe_reducido = $row[$importe_reducido_index];
        $puntos = $row[$puntos_index];

        // Comprobación de si existe o no
        $infracciones = obtenerInfracciones($cod_infraccion);

        if (!empty($infracciones) && $infracciones[0]->total > 0) {
            modificarInfraccion(
                cod_infraccion: $cod_infraccion,
                desc_infraccion: $desc_infraccion,
                importe_infraccion: $importe_infraccion,
                importe_reducido: $importe_reducido,
                puntos: $puntos,
                cod_modulo: $cod_modulo
            );
            continue;
        } 

        $insert = true;
        foreach ($infraccionesInsert as $cod => $m) {
            if ($cod === $cod_infraccion) {
                $insert = false;
                break;
            }
            $m;
        }

        if ($insert !== true) { 
            continue;
        }

        $ins = insertarInfraccion(
            $cod_infraccion,
            $desc_infraccion,
            $importe_infraccion,
            $importe_reducido,
            $puntos,
            $cod_modulo
        );

        if ($ins === true) {
            $infraccionesInsert[$cod_infraccion] = true;
            continue;
        }
        $infraccionesFail[] = $cod_infraccion;
    }

    return [
        'insert' => $infraccionesInsert,
        'errors' => $infraccionesFail
    ];
}

function modificarInfraccion(
    $cod_infraccion = null,
    $cod_infraccion_nuevo = null,
    $desc_infraccion = null,
    $importe_infraccion = null,
    $importe_reducido = null,
    $puntos = null,
    $cod_modulo = null,
) {
    if (!$cod_infraccion) {
        return false;
    }

    $nombre_tabla = '{{.CITY}}.infracciones';
    $datos_tabla = [
        'cod_infraccion' => $cod_infraccion_nuevo,
        'desc_infraccion' => $desc_infraccion,
        'importe_infraccion' => $importe_infraccion,
        'importe_reducido' => $importe_reducido,
        'puntos' => $puntos,
        'cod_modulo' => $cod_modulo,
    ];
    $datos_condicionales = [
        'cod_infraccion' => $cod_infraccion
    ];

    $bd = obtenerConexion();
    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

function existeInfraccion($cod_infraccion) {
    if (!$cod_infraccion) { return false; }

    $infraccion = obtenerInfracciones(cod_infraccion: $cod_infraccion);
    if (!(
        $infraccion &&
            !empty($infraccion) &&
            !isset($infraccion["error"])
    )) {
        return [
            "message" => "El código de infracción no existe",
            "error" => true,
        ];
    }

    return true;
}
function obtenerInfracciones(
    $cod_infraccion = null,
    $desc_infraccion = null,
    $importe_infraccion = null,
    $importe_reducido = null,
    $puntos = null,
    $cod_modulo = null,
) {
    $values = [];
    $sql = "SELECT i.* FROM {{.CITY}}.infracciones i 
	WHERE 1 ";

    if ($cod_infraccion) {
        $sql .= 'AND i.cod_infraccion LIKE ? ';
        $values[] = "%$cod_infraccion%";
    }

    if ($desc_infraccion) {
        $sql .= 'AND i.desc_infraccion LIKE ? ';
        $values[] = "%$desc_infraccion%";
    }

    if ($importe_infraccion) {
        $sql .= 'AND i.importe_infraccion = ? ';
        $values[] = "$importe_infraccion";
    }

    if ($importe_reducido) {
        $sql .= 'AND i.importe_reducido = ? ';
        $values[] = "$importe_reducido";
    }

    if ($puntos) {
        $sql .= 'AND i.puntos = ? ';
        $values[] = "$puntos";
    }

    if ($cod_modulo) {
        $sql .= 'AND i.cod_modulo = ? ';
        $values[] = "$cod_modulo";
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function eliminarInfraccion($cod_infraccion) {
    $nombre_tabla = '{{.CITY}}.infracciones';
    $datos_condicionales = [
        'cod_infraccion' => $cod_infraccion
    ];
    $bd = obtenerConexion();
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}


// ===== Infracciones vehiculos =====
function insertarInfraccionVehiculo(
    $cod_reconoc = null, 
    $cod_alerta = null, 
    $estat = null, 
    $envio = null, 
    $motivo = null, 
    $cod_infraccion = null, 
    $fecha_modif = null, 
    $usuario = null, 
    $tipo = null,
) {
    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.infracciones_vehiculos";
    $datos = [
        "cod_reconoc" => $cod_reconoc, 
        "cod_alerta" => $cod_alerta, 
        "estat" => $estat, 
        "envio" => $envio, 
        "motivo" => $motivo, 
        "cod_infraccion" => $cod_infraccion, 
        "fecha_modif" => $fecha_modif, 
        "usuario" => $usuario, 
        "tipo" => $tipo,
    ];

    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos);
}

function obtenerInfraccionesVehiculosPdtesValidar() {
    $bd = obtenerConexion();
    $sql = "SELECT iv.*, vr.* 
	FROM {{.CITY}}.infracciones_vehiculos iv 
	LEFT JOIN {{.CORE}}.vehiculos_reconocidos vr ON iv.cod_reconoc = vr.cod_reconoc
	WHERE iv.estat = 'p'";

    try {
        return ejecutarConsultaSQL($bd, $sql, [], true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerInfraccionesVehiculosParam(
    $cod_infraccion = null,
    $matricula = null,
    $color = null,
    $marca = null,
    $estat = null,
    $envio = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $hora_ini = null,
    $hora_fin = null,
    $cod_dispositivo = null,
    $tipos = null,
    $nom_dispositivo = null,
    $tipo_vh = null,
    $pais = null,
    $modelo = null,
    $orientacion = null,
    $confidence = null,
    $cod_lista = null,
    $nombre_lista = null,
    $cod_area = null
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = "SELECT DISTINCT i.*, vr.*, it.desc_infraccion, d.nom_dispositivo, ag.cod_alertagest
	FROM {{.CITY}}.infracciones_vehiculos i 
	LEFT JOIN {{.CORE}}.vehiculos_reconocidos vr ON i.cod_reconoc = vr.cod_reconoc
	LEFT JOIN {{.CORE}}.dispositivos d ON d.cod_dispositivo = vr.cod_dispositivo
    LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON d.cod_dispositivo = dm.cod_dispositivo
	LEFT JOIN {{.CITY}}.alertas a ON i.cod_alerta = a.cod_alerta
	LEFT JOIN {{.CITY}}.alertas_gestion ag ON a.cod_alertagest = ag.cod_alertagest
	LEFT JOIN {{.CITY}}.infracciones it ON i.cod_infraccion = it.cod_infraccion 
	LEFT JOIN {{.CITY}}.listas_vehiculos lv ON lv.matricula = vr.matricula 
	LEFT JOIN {{.CITY}}.listas l ON lv.cod_lista = l.cod_lista 
	LEFT JOIN {{.CITY}}.dispositivo_area disp_ar ON disp_ar.cod_dispositivo = d.cod_dispositivo
	LEFT JOIN {{.CITY}}.area_restringida ar ON disp_ar.cod_area = disp_ar.cod_area
	WHERE dm.cod_modulo = '" . MODULOS['infringement']['cod_modulo'] . "' AND dm.estado_canal <> '" . ESTADOS_CANALES['ESTADO_CADUCADO'] . "' ";

    if ($cod_infraccion != null) {
        $sql .= 'AND i.cod_infraccion = ? ';
        $values[] = $cod_infraccion;
    }

    if ($cod_area != null) {
        $sql .= 'AND ar.cod_area = ? ';
        $values[] = $cod_area;
    }

    if ($tipos != null) {
        $strTipo = '';

        if (is_array($tipos)) {
            $strTipo .= 'ag.cod_alertagest IN (';
            for ($i = 0; $i < count($tipos); $i++) {
                $values[] = $tipos[$i];
                $strTipo .= '?, ';
            }
            $strTipo = rtrim($strTipo, ', ');
            $strTipo .= ') ';
        } else {
            $strTipo .= 'ag.cod_alertagest = ? ';
            $values[] = "$tipos";
        }

        $sql .= "AND $strTipo";
    }

    if ($matricula != null) {
        $sql .= 'AND vr.matricula LIKE ? ';
        $values[] = "%$matricula%";
    }

    if ($nom_dispositivo != null) {
        $sql .= 'AND d.nom_dispositivo LIKE ? ';
        $values[] = "%$nom_dispositivo%";
    }

    if ($color != null) {
        $sql .= 'AND vr.color = ? ';
        $values[] = $color;
    }

    if ($marca != null) {
        $sql .= 'AND vr.marca LIKE ? ';
        $values[] = "%$marca%";
    }

    if ($tipo_vh != null) {
        $sql .= 'AND vr.tipo_vh LIKE ? ';
        $values[] = "%$tipo_vh%";
    }

    if ($pais != null) {
        $sql .= 'AND vr.pais LIKE ? ';
        $values[] = "%$pais%";
    }

    if ($modelo != null) {
        $sql .= 'AND vr.modelo LIKE ? ';
        $values[] = "%$modelo%";
    }

    if ($orientacion != null) {
        $sql .= 'AND vr.orientacion LIKE ? ';
        $values[] = "%$orientacion%";
    }

    if ($cod_lista != null) {
        $sql .= 'AND l.cod_lista = ? ';
        $values[] = $cod_lista;
    }

    if ($nombre_lista != null) {
        $sql .= 'AND l.nombre_lista LIKE ? ';
        $values[] = "%$nombre_lista%";
    }

    if ($confidence != null) {
        $menorMayor = substr($confidence, 0, 1);
        $expl = explode($menorMayor, $confidence);

        if (!in_array($menorMayor, ["<", ">", "="])) {
            $menorMayor = '=';
        } else {
            $confidence = implode($expl);
        }

        $sql .= 'AND vr.confidence ' . $menorMayor . ' ? ';
        $values[] = intval($confidence) / 100;
    }

    if ($estat != null) {
        $sql .= 'AND i.estat = ? ';
        $values[] = $estat;
    }

    if ($envio != null) {
        $sql .= 'AND i.envio = ? ';
        $values[] = $envio;
    }

    if ($fecha_ini != null && $fecha_fin != null) {
        $sql .= 'AND vr.fecha BETWEEN ? AND ? ';
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    }

    if ($hora_ini != null && $hora_fin != null) {
        $sql .= 'AND vr.hora BETWEEN ? AND ? ';
        $values[] = $hora_ini;
        $values[] = $hora_fin;
    }

    if ($cod_dispositivo != null) {
        $sql .= 'AND vr.cod_dispositivo = ? ';
        $values[] = $cod_dispositivo;
    }

    $sql .= ' ORDER BY vr.fecha DESC, vr.hora DESC ';

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerInfraccionesVehiculosGroupBy(
    $fecha_ini = null,
    $fecha_fin = null,
    $hora_ini = null,
    $hora_fin = null,
    $matricula = null,
    $color = null,
    $marca = null,
    $tipo = null,
    $tipo_vh = null,
    $pais = null,
    $dispositivos = null,
    $velocidad_vehiculo = null,
    $campos = null,
    $order = null,
    $direccion = null,
    $estat = null,
    $envio = null,
    $cod_infraccion = null,
    $usuario = null,
    $cod_provincia = null,
    $modelo = null,
    $cod_poblacion = null,
    $modulos = null,
    $confidence = null,
    $orientacion = null,
    $cod_lista = null,
    $alertas = null,
    $h24 = false
) {
    $seleccion = '';
    $agrupacion = '';
    $orden = '';
    $values = [];

    foreach ($campos as $campo => $valor) {
        ${$campo} = $valor;
        $valor = match($valor) {
            'hora' => 'hour(CAST(i.fecha_modif AS TIME)) as hora',
            'modulo' => 'm.nombre_modulo',
            'cod_dispositivo' => 'd.cod_dispositivo, d.coordenadas',
            'tipo_vh' => 'vr.tipo_vh',
            'estat' => 'i.estat',
            'envio' => 'i.envio',
            'fecha' => 'CAST(i.fecha_modif AS DATE) as fecha',
            'cod_alertagest' => 'ag.cod_alertagest, ag.nombre_alerta',
            default => null,
        };

        if (!$valor) { continue; }

        $seleccion .= "$valor, ";
    }

    $seleccion = rtrim($seleccion, ', ');

    $sql = "SELECT $seleccion, COUNT(cod_sancion) as total 
	FROM {{.CITY}}.infracciones_vehiculos i 
	LEFT JOIN {{.CITY}}.alertas a ON i.cod_alerta = a.cod_alerta
	LEFT JOIN {{.CITY}}.alertas_gestion ag ON a.cod_alertagest = ag.cod_alertagest
	LEFT JOIN {{.CORE}}.modulos m ON m.cod_modulo = ag.cod_modulo
	LEFT JOIN {{.CORE}}.vehiculos_reconocidos vr ON i.cod_reconoc = vr.cod_reconoc
	LEFT JOIN {{.CITY}}.listas_vehiculos lv ON lv.matricula = vr.matricula 
	LEFT JOIN {{.CORE}}.dispositivos d ON d.cod_dispositivo = vr.cod_dispositivo
    LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON d.cod_dispositivo = dm.cod_dispositivo
	";

    $where = "WHERE dm.cod_modulo = '" . MODULOS['infringement']['cod_modulo'] . "' AND dm.estado_canal <> '" . ESTADOS_CANALES['ESTADO_CADUCADO'] . "' ";
    if ($h24 === true) {
        $where .= 'AND i.fecha_modif >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ';
    } else if ($fecha_ini != null && $fecha_ini != null) {
        $where .= 'AND CAST(i.fecha_modif AS DATE) BETWEEN ? AND ? ';
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    }

    if ($hora_ini != null && $hora_fin != null) {
        $where .= 'AND CAST(i.fecha_modif AS TIME) BETWEEN ? AND ? ';
        $values[] = $hora_ini;
        $values[] = $hora_fin;
    }

    if ($matricula != null) {
        $where .= 'AND vr.matricula LIKE ? ';
        $values[] = "%$matricula%";
    }

    if ($direccion != null) {
        $where .= 'AND vr.direccion = ? ';
        $values[] = $direccion;
    }

    if ($estat != null) {
        $where .= 'AND i.estat = ? ';
        $values[] = $estat;
    }

    if ($envio != null) {
        $where .= 'AND i.envio = ? ';
        $values[] = $envio;
    }

    if ($cod_infraccion != null) {
        $where .= 'AND i.cod_infraccion = ? ';
        $values[] = $cod_infraccion;
    }

    if ($usuario != null) {
        $where .= 'AND i.usuario = ? ';
        $values[] = $usuario;
    }

    if ($tipo != null) {
        $where .= 'AND i.tipo LIKE ? ';
        $values[] = "%$tipo%";
    }

    if ($modulos != null and !empty($modulos)) {
        $where .= 'AND m.cod_modulo IN (';
        for ($i = 0; $i < count($modulos); $i++) {
            $values[] = $modulos[$i];
            $where .= '?, ';
        }
        $where = rtrim($where, ', ');
        $where .= ') ';
    }

    if ($color != null) {
        $where .= 'AND vr.color LIKE ? ';
        $values[] = "%$color%";
    }

    if ($marca != null) {
        $where .= 'AND vr.marca LIKE ? ';
        $values[] = "%$marca%";
    }

    if ($modelo != null) {
        $where .= 'AND vr.modelo LIKE ? ';
        $values[] = "%$modelo%";
    }

    if ($tipo_vh != null) {
        if (is_array($tipo_vh) && !empty($tipo_vh)) {
            $where .= 'AND vr.tipo_vh IN (';
            for ($i = 0; $i < count($tipo_vh); $i++) {
                $where .= '?, ';
                $values[] = $tipo_vh[$i];
            }
            $where = rtrim($where, ', ') . ') ';
        } else {
            $where .= 'AND vr.tipo_vh = ? ';
            $values[] = $tipo_vh;
        }
    }

    if ($cod_provincia != null) {
        $where .= 'AND vr.cod_provincia = ?';
        $values[] = $cod_provincia;
    }

    if ($pais != null) {
        $where .= 'AND vr.pais = ? ';
        $values[] = $pais;
    }

    if ($cod_poblacion != null) {
        $where .= 'AND vr.cod_poblacion = ? ';
        $values[] = $cod_poblacion;
    }

    if ($dispositivos != null)
        if (is_array($dispositivos) && !empty($dispositivos)) {
            $where .= 'AND vr.cod_dispositivo IN (?, ';
            $values[] = current($dispositivos);
            while (next($dispositivos) != null) {
                $where .= '?, ';
                $values[] = current($dispositivos);
            }
            $where = rtrim($where, ', ');
            $where .= ') ';
        }

    if ($orientacion != null) {
        $where .= 'AND vr.orientacion = ? ';
        $values[] = $orientacion;
    }

    if ($cod_lista != null) {
        $where .= 'AND lv.cod_lista = ? ';
        $values[] = $cod_lista;
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

    foreach ($campos as $campo => $valor) {
        ${$campo} = $valor;
        $valor = match($valor) {
            'hora' => 'hour(CAST(i.fecha_modif AS TIME))',
            'modulo' => 'm.nombre_modulo',
            'cod_dispositivo' => 'd.cod_dispositivo',
            'tipo_vh' => 'vr.tipo_vh',
            'estat' => 'i.estat',
            'envio' => 'i.envio',
            'fecha' => 'CAST(i.fecha_modif AS DATE)',
            'cod_alertagest' => 'ag.cod_alertagest',
            default => null,
        };

        if (!$valor) { continue; }
        $agrupacion .= $valor . ', ';
    }

    $agrupacion = rtrim($agrupacion, ', ');  // elimina la última coma y espacio en blanco
    $sql .= "$where GROUP BY " . $agrupacion;

    // ORDER
    if (!empty($order)) {
        foreach ($order as $ord => $valor) {
            ${$ord} = $valor;
            $orden .= $valor . ', ';
        }

        $orden = rtrim($orden, ', ');  // elimina la última coma y espacio en blanco
        $sql .= ' ORDER BY ' . $orden;
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}


function obtenerInfraccionesVehiculosPorId($infracciones) {
    $values = [];
    $bd = obtenerConexion();
    $sql = "SELECT iv.*, vr.*, i.* 
	FROM {{.CITY}}.infracciones_vehiculos iv 
	LEFT JOIN {{.CITY}}.infracciones i ON iv.cod_infraccion = i.cod_infraccion
	LEFT JOIN {{.CORE}}.vehiculos_reconocidos vr ON iv.cod_reconoc = vr.cod_reconoc
	WHERE 1 ";

    if ($infracciones != null && is_array($infracciones) && !empty($infracciones)) {
        $sql .= 'AND iv.cod_sancion IN (';
        foreach ($infracciones as $inf) {
            $cod_sancion = $inf->cod_sancion;

            $sql .= '?, ';
            $values[] = $cod_sancion;
        }
        $sql = rtrim($sql, ', ');
        $sql .= ');';
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function validarInfraccionVehiculo($infracciones) {
    if (count($infracciones) <= 0) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.infracciones_vehiculos";
    $datos = ["estat" => "v"];
    $datos_condicionales = [
        "cod_sancion" => array_map(
            array: $infracciones,
            callback: function ($i) {
                return $i->cod_sancion;
            },
        ),
    ];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

function rechazarInfraccionVehiculo($cod_sancion, $motivo = '') {
    if ($cod_sancion == null) {
        return false;
    }
    $bd = obtenerConexion();

    $nombre_tabla = "{{.CITY}}.infracciones_vehiculos";
    $datos = [
        "estat" => "r",
        "motivo" => $motivo,
    ];
    $datos_condicionales = [
        "cod_sancion" => $cod_sancion,
    ];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

function enviarInfraccionesVehiculos($infracciones) {
    if (!($infracciones != null && count($infracciones) > 0)) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.infracciones_vehiculos";
    $datos = [
        "envio" => "s",
        "estat" => "c"
    ];
    $datos_condicionales = [
        "cod_sancion" => array_map(
            array: $infracciones,
            callback: function ($i) {
                return $i->cod_sancion;
            },
        ),
    ];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

function enviarDiputacion($nombre_fichero, $datos) {
    $envio = [];

    // cod_sancion, fecha, hora, matricula, cod_dispositivo, cod_infraccion, desc_infraccions
    foreach ($datos as $inf) {
        $arr = $inf;
        array_push($envio, $arr);
    }

    $archivo = fopen($nombre_fichero, 'w+b');  // Abrir el archivo, creándolo si no existe
    if ($archivo == false) {
        fclose($archivo);  // Cerrar el archivo
        return [
            "message" => "Error al crear el archivo",
            "error" => true,
        ];
    }
    
    // Escribir en el archivo:
    $writeValues = function (array $values) use ($archivo) {
        foreach ($values as $val) {
            if (!is_string($val)) {
                continue;
            }

            fwrite($archivo, $val);
        }
    };

    foreach ($envio as $val) {
        $codigo_ayuntamiento = str_pad('', 3, '0', STR_PAD_LEFT) . "\r\n";
        $num_expediente = str_pad('', 10, '0', STR_PAD_LEFT) . "\r\n";
        $agente = str_pad('', 5, ' ', STR_PAD_LEFT) . "\r\n";
        $tipo_matricula = str_pad(8, 1, '0', STR_PAD_LEFT) . "\r\n";
        $matricula = str_pad($val->matricula, 11, ' ', STR_PAD_LEFT) . "\r\n";

        $fecha = explode('-', $val->fecha);
        $fecha[0] = substr($fecha[0], -2);
        $fecha = str_pad(implode('', $fecha), 4, '0', STR_PAD_LEFT) . "\r\n";

        $hora = explode(':', $val->hora);
        unset($hora[2]);
        $hora = str_pad(implode('', $hora), 4, '0', STR_PAD_LEFT) . "\r\n";

        $importe = str_pad('', 6, '0', STR_PAD_LEFT) . "\r\n";
        $estado = str_pad('', 1, '0', STR_PAD_LEFT) . "\r\n";
        $sitio_hechos = str_pad('', 60, ' ', STR_PAD_LEFT) . "\r\n";
        $motivo_no_parada = str_pad('', 1, ' ', STR_PAD_LEFT) . "\r\n";
        $codigo_conductor = str_pad('', 1, 'A', STR_PAD_LEFT) . "\r\n";  // T/A/D

        $writeValues([
            $codigo_ayuntamiento,  // Codigo ayuntamiento N(3)
            $num_expediente,  // Num expediente X(10)
            $agente,  // Agente X(5)
            $tipo_matricula,  // Tipo matricula N(1)
            $matricula,  // Matricula/ Identificacion vehiculo X(11)
            $fecha,  // Fecha N(6)
            $hora,  // Hora N(4)
            $importe,  // Importe N(6)
            $estado,  // Estado N(1)
            $sitio_hechos,  // Sitio hechos X(60)
            $motivo_no_parada,  // Motivo de no parada X(1)
            $codigo_conductor,  // Codigo del conductor X(1)
        ]);

        if ($codigo_conductor[0] == 'T' || $codigo_conductor[0] == 'A') {
            $dni_conductor = str_pad('', 9, ' ', STR_PAD_LEFT) . "\r\n";
            $nombre_conductor = str_pad('', 40, ' ', STR_PAD_LEFT) . "\r\n";
            $direccion = substr($val->direccion, 0, 44);
            $direccion = str_pad($direccion, 44, ' ', STR_PAD_LEFT) . "\r\n";
            $codigo_postal = str_pad('', 5, '0', STR_PAD_LEFT) . "\r\n";
            $municipio_dir_fiscal = str_pad('', 25, '0', STR_PAD_LEFT) . "\r\n";
            $cod_incidencia = str_pad('', 2, ' ', STR_PAD_LEFT) . "\r\n";
            $infraccion_norma = str_pad('', 3, ' ', STR_PAD_LEFT) . "\r\n";
            $infraccion_articulo = str_pad('', 3, '0', STR_PAD_LEFT) . "\r\n";
            $infraccion_apartado = str_pad('', 2, ' ', STR_PAD_LEFT) . "\r\n";
            $infraccion_subapartado = str_pad('', 2, '0', STR_PAD_LEFT) . "\r\n";
            $infraccion_n_conducta = str_pad('', 2, ' ', STR_PAD_LEFT) . "\r\n";
            $denunciante = str_pad('', 1, ' ', STR_PAD_LEFT) . "\r\n";
            $dni_denunciante = str_pad('', 9, ' ', STR_PAD_LEFT) . "\r\n";
            $idioma_desc_ampliada = str_pad('E', 1, ' ', STR_PAD_LEFT) . "\r\n";
            $desc1 = substr($val->desc_infraccion, 0, 60);
            $desc1 = str_pad($desc1, 60, ' ', STR_PAD_RIGHT) . "\r\n";
            $desc2 = str_pad('', 60, ' ', STR_PAD_RIGHT) . "\r\n";
            $desc3 = str_pad('', 60, ' ', STR_PAD_RIGHT) . "\r\n";
            $desc4 = str_pad('', 60, ' ', STR_PAD_RIGHT) . "\r\n";
            $desc5 = str_pad('', 60, ' ', STR_PAD_RIGHT) . "\r\n";
            $menor = str_pad('', 1, ' ', STR_PAD_LEFT) . "\r\n";
            $via_penal = str_pad('', 1, ' ', STR_PAD_LEFT) . "\r\n";
            $retirada_carnet = str_pad('', 1, ' ', STR_PAD_LEFT) . "\r\n";
            $foto = str_pad('', 1, ' ', STR_PAD_LEFT) . "\r\n";
            $origen_via = str_pad('', 1, ' ', STR_PAD_LEFT) . "\r\n";
            $cod_via = str_pad('', 5, '0', STR_PAD_LEFT) . "\r\n";
            $num_via = str_pad('', 5, '0', STR_PAD_LEFT) . "\r\n";

            $writeValues([
                $dni_conductor,  // DNI/NIF del conductor X(9)
                $nombre_conductor,  // Nombre del conductor X(40)
                $direccion,  // Direccion fiscal para notificaciones X(44)
                $codigo_postal,  // Codigo postal N(5)
                $municipio_dir_fiscal,  // Descriptivo municipio direccion fiscal N(25)
                $cod_incidencia,  // Codigo incidencia X(2)
                $infraccion_norma,  // Infraccion Norma X(3)
                $infraccion_articulo,  // Infraccion Articulo N(3)
                $infraccion_apartado,  // Infraccion Apartado X(2)
                $infraccion_subapartado,  // Infraccion Subapartado N(2)
                $infraccion_n_conducta,  // Infraccion Nº conducta X(2)
                $denunciante,  // Deunciante X(1)
                $dni_denunciante,  // DNI/NIF deunciante X(9)
                $idioma_desc_ampliada,  // Idioma descripcion ampliada X(1)
                $desc1,  // Descripcion ampliada 1 X(60)
                $desc2,  // Descripcion ampliada 2 X(60)
                $desc3,  // Descripcion ampliada 3 X(60)
                $desc4,  // Descripcion ampliada 4 X(60)
                $desc5,  // Descripcion ampliada 5 X(60)
                $menor,  // Menor X(1)
                $via_penal,  // Via penal X(1)
                $retirada_carnet,  // Retirada del carnet X(1)
                $foto,  // Foto  X(1)
                $origen_via,  // Orígen vía X(1)
                $cod_via,  // Codi vía N(5)
                $num_via,  // Número vía N(5)
            ]);
        }
    }

    // Fuerza a que se escriban los datos pendientes en el buffer:
    fflush($archivo);
    fclose($archivo);  // Cerrar el archivo

    // TODO: Enviar datos FTP
    return true;
}

