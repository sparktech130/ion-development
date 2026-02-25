<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/main.php";
function obtenerVehiculosPadronParam(
    $matricula = null,
    $marca = null,
    $modelo = null,
    $color = null,
    $limit = null
) {
    $sql = 'SELECT vp.* 
    FROM {{.CITY}}.vehiculo_padron vp 
    WHERE 1 ';
    $values = [];

    if ($matricula) {
        $sql .= 'AND vp.matricula LIKE ? ';
        $values[] = "%$matricula%";
    }

    if ($marca) {
        $sql .= 'AND vp.marca LIKE ? ';
        $values[] = "%$marca%";
    }

    if ($modelo) {
        $sql .= 'AND vp.modelo LIKE ? ';
        $values[] = "%$modelo%";
    }

    if ($color) {
        $sql .= 'AND vp.color LIKE ? ';
        $values[] = "%$color%";
    }

    if ($limit) {
        $sql .= 'LIMIT ?;';
        $values[] = $limit;
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerVehiculosPadronCount() {
    $sql = 'SELECT COUNT(vp.matricula) as total FROM {{.CITY}}.vehiculo_padron vp ';
    $values = [];

    try {
        $bd = obtenerConexion();
        $cmps = ejecutarConsultaSQL($bd, $sql, $values, true);
        if (empty($cmps) || isset($cmps['error'])) {
            return 0;
        } 
        return $cmps[0]->total;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function insertarVehiculoPadron(
    $matricula = null,
    $marca = null,
    $modelo = null,
    $color = null,
    $fecha_fin_padron = null
) {
    if (!$matricula) {
        return false;
    }

    $nombre_tabla = '{{.CITY}}.vehiculo_padron';
    $datos_tabla = [
        'matricula' => $matricula,
        'marca' => $marca,
        'modelo' => $modelo,
        'color' => $color,
        'fecha_fin_padron' => $fecha_fin_padron,
    ];

    $bd = obtenerConexion();
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla);
}

function modificarVehiculoPadron(
    $matricula = null,
    $marca = null,
    $modelo = null,
    $color = null,
    $fecha_fin_padron = null
) {
    if (!$matricula)
        return false;

    $nombre_tabla = '{{.CITY}}.vehiculo_padron';
    $datos_tabla = [
        'marca' => $marca,
        'modelo' => $modelo,
        'color' => $color,
        'fecha_fin_padron' => $fecha_fin_padron,
    ];
    $datos_condicionales = [
        'matricula' => $matricula,
    ];

    $bd = obtenerConexion();
    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

function eliminarVehiculoPadron($matricula = null)
{
    if (!$matricula)
        return false;

    $nombre_tabla = '{{.CITY}}.vehiculo_padron';
    $datos_condicionales = [
        'matricula' => $matricula,
    ];

    $bd = obtenerConexion();
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function importarVehiculosPadron($archivo_csv)
{
    // Lee el encabezado del archivo CSV
    $header = fgetcsv($archivo_csv);

    // Índices de los campos necesarios
    $matricula_index = array_search('matricula', $header);
    $marca_index = array_search('marca', $header);
    $modelo_index = array_search('modelo', $header);
    $color_index = array_search('color', $header);
    $fecha_fin_index = array_search('fecha_fin', $header);

    $matriculasInsert = [];
    $matriculasFail = [];

    // Filas del archivo CSV
    while (($row = fgetcsv($archivo_csv)) !== false) {
        $matricula = $row[$matricula_index];
        $marca = $row[$marca_index];
        $modelo = $row[$modelo_index];
        $color = $row[$color_index];
        $fecha_fin = $row[$fecha_fin_index];

        // Comprobación de si existe o no
        $matriculas = obtenerVehiculosPadronParam($matricula);

        if (!empty($matriculas)) {
            modificarVehiculoPadron(
                matricula: $matricula,
                marca: $marca,
                modelo: $modelo,
                color: $color,
                fecha_fin_padron: $fecha_fin
            );
            continue;
        }

        $insert = true;
        foreach ($matriculasInsert as $cod => $m) {
            if ($cod === $matricula) {
                $insert = false;
                break;
            }
            $m;
        }

        if ($insert === true) {
            $ins = insertarVehiculoPadron(
                $matricula,
                $marca,
                $modelo,
                $color,
                $fecha_fin
            );

            if ($ins === true) {
                $matriculasInsert[$matricula] = true;
                continue;
            }

            $matriculasFail[$matricula] = $ins;
            continue;
        }
    }

    return [
        'insert' => $matriculasInsert,
        'errors' => $matriculasFail
    ];
}
