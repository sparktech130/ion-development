<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/dispositivos/main.php";

// ===== Areas Restringidas =====
function insertarAreaRestringida(
    $nombre_area = null,
    $tipo_area = null,
    $cod_infraccion = null,
    $coordenadas = null,
) {
    try {
        $bd = obtenerConexion();
        $nombre_tabla = "{{.CITY}}.area_restringida";
        $datos = [
            "nombre_area" => $nombre_area,
            "tipo_area" => $tipo_area,
            "cod_infraccion" => $cod_infraccion,
            "coordenadas" => $coordenadas,
        ];
        $cod_area = insertarDatosTabla(
            $bd,
            __FUNCTION__,
            $nombre_tabla,
            $datos,
            true,
        );
        if ($cod_area === false) {
            return $cod_area;
        }

        comprobarAreasDispositivos(cod_area: $cod_area);

        return $cod_area != false;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'insert', $e);
    }
}

function obtenerAreaRestringidaParam(
    $cod_area = null,
    $nombre_area = null,
    $tipo_area = null,
    $coordenadas = null
) {
    $values = [];
    $bd = obtenerConexion();
    $sql = "SELECT ar.* 
	FROM {{.CITY}}.area_restringida ar 
	WHERE 1 ";

    if ($cod_area != null) {
        $sql .= 'AND ar.cod_area = ? ';
        $values[] = $cod_area;
    }

    if ($nombre_area != null) {
        $sql .= 'AND ar.nombre_area LIKE ? ';
        $values[] = "%$nombre_area%";
    }

    if ($tipo_area != null) {
        if (is_array($tipo_area)) {
            $tipos = '';
            foreach ($tipo_area as $key => $value) {
                if ($value != '') {
                    if ($key > 0) {
                        $tipos .= 'OR';
                    }
                    $tipos .= ' ar.tipo_area LIKE ? ';
                    $values[] = "%$value%";
                }
            }

            $sql .= " AND ($tipos) ";
        } else {
            $sql .= ' AND ar.tipo_area LIKE ? ';
            $values[] = "%$tipo_area%";
        }
    }

    if ($coordenadas != null) {
        $sql .= 'AND ar.coordenadas = ? ';
        $values[] = $coordenadas;
    }

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerAreaRestringidaCount()
{
    $values = [];
    $sql = "SELECT COUNT(ar.cod_area) as total FROM {{.CITY}}.area_restringida ar;";

    try {
        $bd = obtenerConexion();
        $result = ejecutarConsultaSql($bd, $sql, $values, true);
        return $result[0]->total ?? 0;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function modificarAreaRestringida(
    $cod_area,
    $nombre_area = null,
    $tipo_area = null,
    $cod_infraccion = null,
    $coordenadas = null,
) {
    if ($cod_area == null) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.area_restringida";
    $datos = [
        "nombre_area" => $nombre_area,
        "tipo_area" => $tipo_area,
        "cod_infraccion" => $cod_infraccion,
        "coordenadas" => $coordenadas,
    ];
    $datos_condicionales = [
        "cod_area" => $cod_area,
    ];

    $update = modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
    if ($update === true) {
        comprobarAreasDispositivos(cod_area: $cod_area);
    }

    return $update;
}

function eliminarAreaRestringida($cod_area)
{
    if ($cod_area == null) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.area_restringida";
    $datos_condicionales = [
        "cod_area" => $cod_area,
    ];

    $delete = eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
    return $delete;
}


// ===== Areas Autorizados =====
function insertarAreaAutorizados(
    $cod_area = null,
    $matricula = null,
    $observaciones = null,
    $fecha_alta = null,
    $fecha_baja = null,
) {
    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.area_autorizados";
    $datos = [
        "cod_area" => $cod_area,
        "matricula" => $matricula,
        "observaciones" => $observaciones,
        "fecha_alta" => $fecha_alta,
        "fecha_baja" => $fecha_baja,
    ];

    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos);
}

function importarAreaAutorizados($cod_area, $archivo_csv)
{
    $bd = obtenerConexion();

    // Lee el encabezado del archivo CSV
    $header = fgetcsv($archivo_csv);

    // Índices de los campos necesarios
    $matricula_index = array_search('matricula', $header);
    $observaciones_index = array_search('observaciones', $header);
    $fecha_alta_index = array_search('fecha_alta', $header);
    $fecha_baja_index = array_search('fecha_baja', $header);

    $values = [];
    $valuesSql = "VALUES ";
    $matriculasInsert = [];
    $matriculasRepetidas = [];

    // Filas del archivo CSV
    while (($row = fgetcsv($archivo_csv)) !== false) {
        $matricula = $row[$matricula_index];
        $observaciones = $row[$observaciones_index];
        $fecha_alta = $row[$fecha_alta_index];
        $fecha_baja = $row[$fecha_baja_index];

        // Comprobación de si existe o no
        $matriculas = obtenerAreaAutorizados(
            cod_area: $cod_area,
            matricula: $matricula,
        );

        if (!empty($matriculas) && count($matriculas) == 0) {
            $matriculasRepetidas[] = ["matricula" => $matricula, "cod_area" => $cod_area];
            continue;
        }

        $insert = true;
        foreach ($matriculasInsert as $m) {
            if ($m['matricula'] === $matricula && $m['cod_area'] === $cod_area) {
                $insert = false;
                $matriculasRepetidas[] = ["matricula" => $matricula, "cod_area" => $cod_area];
            }
        }

        if ($insert === true) {
            $valuesSql .= "(?, ?, ?, ?, ?), ";
            $values[] = $cod_area;
            $values[] = $matricula;
            $values[] = $observaciones;
            $values[] = $fecha_alta;
            $values[] = $fecha_baja;

            $matriculasInsert[] = ["matricula" => $matricula, "cod_area" => $cod_area];
        }
    }

    if (empty($values)) {
        return [
            "message" => "Error al insertar: Campos necesarios no recibidos",
            "matriculas_repetidas" => $matriculasRepetidas,
            "error" => true
        ];
    }

    $valuesSql = rtrim($valuesSql, ", ");

    $sql = "INSERT INTO {{.CITY}}.area_autorizados (cod_area, matricula, observaciones, fecha_alta, fecha_baja) $valuesSql";
    try {
        $sql = renderQuery($sql);
        return [
            "insert" => ejecutarConsultaSQL($bd, $sql, $values, false),
            "matriculas_insertadas" => $matriculasInsert,
            "matriculas_repetidas" => $matriculasRepetidas
        ];
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "insert", $e, true);
    }
}

function obtenerAreaAutorizados(
    $cod_area = null,
    $matricula = null,
    $fecha_alta = null,
    $fecha_baja = null,
    $observaciones = null
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = 'SELECT aa.* 
    FROM {{.CITY}}.area_autorizados aa 
    WHERE 1 ';

    if ($cod_area != null) {
        $sql .= 'AND aa.cod_area = ? ';
        $values[] = $cod_area;
    }

    if ($matricula != null) {
        $sql .= 'AND aa.matricula LIKE ? ';
        $values[] = "%$matricula%";
    }

    if ($fecha_alta != null) {
        $sql .= 'AND aa.fecha_alta = ? ';
        $values[] = $fecha_alta;
    }

    if ($fecha_baja != null) {
        $sql .= 'AND aa.fecha_baja = ? ';
        $values[] = $fecha_baja;
    }

    if ($observaciones != null) {
        $sql .= 'AND aa.observaciones LIKE ? ';
        $values[] = "%$observaciones%";
    }

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerAreaAutorizadosCount()
{
    $bd = obtenerConexion();
    $values = [];
    $sql = "SELECT COUNT(cod_autorizado) as total FROM {{.CITY}}.area_autorizados";

    try {
        $result = ejecutarConsultaSql($bd, $sql, $values, true);

        return $result[0]->total ?? 0;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function modificarAreaAutorizados(
    $cod_autorizado = null,
    $cod_area = null,
    $matricula = null,
    $observaciones = null,
    $fecha_alta = null,
    $fecha_baja = null,
) {
    if ($cod_autorizado == null) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.area_autorizados";
    $datos = [
        "cod_area" => $cod_area,
        "matricula" => $matricula,
        "observaciones" => $observaciones,
        "fecha_alta" => $fecha_alta,
        "fecha_baja" => $fecha_baja,
    ];
    $datos_condicionales = ["cod_autorizado" => $cod_autorizado];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

function eliminarAreaAutorizados(
    $cod_autorizado = null,
    $cod_area = null,
) {
    if ($cod_autorizado == null && $cod_area == null) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.area_autorizados";
    $datos_condicionales = [
        "cod_autorizado" => $cod_autorizado,
        "cod_area" => $cod_area,
    ];

    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function obtenerAreasCoordenadas(
    $sinMatricula = null,
    $latitud = null,
    $longitud = null,
) {
    $bd = obtenerConexion();
    $values = [];

    $sql =
        "SELECT 
        ar.cod_area, ar.coordenadas, ar.tipo_area, ag.cod_alertagest
    FROM 
        {{.CITY}}.area_restringida ar 
    LEFT JOIN 
        {{.CITY}}.alertas_gestion ag 
            ON ar.tipo_area = ag.nombre_alerta
    ";
    $where = "WHERE 1 ";

    if ($sinMatricula) {
        $sql .= "LEFT JOIN {{.CITY}}.area_autorizados ara ON ara.cod_area = ar.cod_area ";

        $where .= "AND (ara.matricula <> ? OR ara.matricula IS NULL) ";
        $values[] = $sinMatricula;
    }

    $sql = "
        {$sql} 
        {$where}
    ";

    try {
        $areas = ejecutarConsultaSQL($bd, $sql, $values, true);

        if (!(is_array($areas) && !empty($areas))) {
            return [];
        }

        $puntoFormatado = [
            "lat" => $latitud,
            "lng" => $longitud,
        ];

        $returnObj = [];
        foreach ($areas as $ar) {
            $cod_area = $ar->cod_area;
            $cods_area[] = $cod_area;
            $area = explode(";", $ar->coordenadas);
            $areaFormatada = [];
            foreach ($area as $key => $val) {
                $aux = explode(",", $val);
                $areaFormatada[$key]["lat"] = $aux[0];
                $areaFormatada[$key]["lng"] = $aux[1];
            }

            $estaDentro = comprobarAreaCoordenadas($puntoFormatado, $areaFormatada);
            if (!$estaDentro) {
                continue;
            }

            $returnObj[] = $ar;
        }

        return $returnObj;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

// ===== Gestión áreas en dispositivos =====
function obtenerAreaDispositivos(
    $cod_dispositivo = null,
    $cod_area = null,
    $sinMatricula = null,
) {
    $bd = obtenerConexion();
    $values = [];

    $sql =
        "SELECT 
        da.cod_area, da.cod_dispositivo, ar.tipo_area, ag.cod_alertagest
    FROM {{.CITY}}.dispositivo_area da 
    LEFT JOIN 
        {{.CITY}}.area_restringida ar 
            ON da.cod_area = ar.cod_area 
    LEFT JOIN 
        {{.CITY}}.alertas_gestion ag 
            ON ar.tipo_area = ag.nombre_alerta
    ";
    $where = "WHERE 1 ";

    if ($cod_dispositivo) {
        $where .= "AND da.cod_dispositivo ";
        if (is_array($cod_dispositivo) && !empty($cod_dispositivo)) {
            $where .= "IN (";
            foreach ($cod_dispositivo as $disp) {
                $where .= '?, ';
                $values[] = $disp;
            }
            $where = rtrim($where, ', ');
            $where .= ') ';
        } else {
            $where .= "= ? ";
            $values[] = $cod_dispositivo;
        }
    }

    if ($cod_area) {
        $where .= "AND da.cod_area LIKE ? ";
        $values[] = "%$cod_area%";
    }

    if ($sinMatricula) {
        $sql .= "LEFT JOIN {{.CITY}}.area_autorizados ara ON ara.cod_area = ar.cod_area ";

        $where .= "AND (ara.matricula <> ? OR ara.matricula IS NULL) ";
        $values[] = $sinMatricula;
    }

    $sql = "
        {$sql} 
        {$where}
    ";

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerAreasRestringidasMatricula(
    $matricula = null,
    $cod_dispositivo = null,
) {
    $areas = obtenerAreaDispositivos(
        cod_dispositivo: $cod_dispositivo,
        sinMatricula: $matricula,
    );
    if (!(
        $areas &&
        !empty($areas) &&
        !isset($areas["error"])
    )) {
        return null;
    }

    if (empty($areas)) return null;
}

function modificarAreaDispositivo(
    $cod_dispositivo,
    $cod_area,
) {
    if (!($cod_dispositivo && $cod_area)) {
        return false;
    }

    $bd = obtenerConexion();

    $nombre_tabla = "{{.CORE}}.dispositivo_area";
    $datos = [
        "cod_area" => $cod_area,
        "cod_dispositivo" => $cod_dispositivo,
    ];

    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos);
}

function obtenerAlertasAreaMatricula(
    $matricula = null,
    $cod_dispositivo = null,
) {
    $areas = obtenerAreaDispositivos(
        cod_dispositivo: $cod_dispositivo,
        sinMatricula: $matricula,
    );
    $alertagest = array_values(array_unique(array_map(
        callback: function ($a) {
            return [
                "cod_area" => $a->cod_area,
                "cod_alertagest" => $a->cod_alertagest,
            ];
        },
        array: $areas,
    ), SORT_STRING));

    return $alertagest;
}

function obtenerAlertasAreaMatriculaCoordenadas(
    $matricula = null,
    $lat = null,
    $lon = null,
) {
    if (!($matricula && $lat && $lon)) {
        return null;
    }

    $areas = obtenerAreasCoordenadas(
        sinMatricula: $matricula,
        latitud: $lat,
        longitud: $lon,
    );
    if (isset($areas["error"]) && $areas["error"] === true) {
        return $areas;
    }

    $alertagest = array_values(array_unique(array_map(
        callback: function ($a) {
            return [
                "cod_area" => $a->cod_area,
                "cod_alertagest" => $a->cod_alertagest,
            ];
        },
        array: $areas,
    ), SORT_STRING));

    return $alertagest;
}
