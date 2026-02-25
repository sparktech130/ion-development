<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

if (!defined("CATEGORIAS_DISPOSITIVOS")) {
    define("CATEGORIAS_DISPOSITIVOS", [
        "SENSOR_AMBIENTE" => 1,
        "CAMARA" => 2,
        "SENSOR_ACCESO" => 3,
        "MONITOR" => 4,
        "SENSOR_ALMACENAJE" => 5,
        "MAQUINA" => 6,
        "TELEFONO" => 12,
    ]);
}

function obtenerCategorias(
    $cod_categoria = null,
    $nombre_categoria = null,
    $cod_sector = null,
) {
    $values = [];
    $sql =
        "SELECT 
        c.*, GROUP_CONCAT(sv.cod_sector) as sectores
    FROM 
        {{.CORE}}.fabricantes_categoria c 
    LEFT JOIN
        {{.CORE}}.fabricantes_categoria_sector sv
            ON sv.cod_categoria = c.cod_categoria
    WHERE 1 ";

    if ($cod_categoria != null) {
        $sql .= "AND c.cod_categoria = ? ";
        $values[] = $cod_categoria;
    }

    if ($nombre_categoria != null) {
        $sql .= "AND c.nombre_categoria = ? ";
        $values[] = $nombre_categoria;
    }

    if ($cod_sector != null) {
        $sql .= "AND sv.cod_sector = ? ";
        $values[] = $cod_sector;
    }

    $sql .= "GROUP BY c.cod_categoria";

    try {
        $bd = obtenerConexion();
        $cat = ejecutarConsultaSQL($bd, $sql, $values, true);
        foreach ($cat as $c) {
            $c->sectores = explodeGroupConcat(
                $c->sectores,
            );
            $c->fabricantes = obtenerFabricantesParam(cod_categoria: $c->cod_categoria);
        }
        return $cat;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function insertarFabricantes(
    $nombre_fabricante = null,
    $logo_fabricante = null,
    $descripcion_fabricante = null,
) {
    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.fabricantes";
    $datos = [
        "nombre_fabricante" => $nombre_fabricante,
        "logo_fabricante" => $logo_fabricante,
        "descripcion_fabricante" => $descripcion_fabricante,
    ];
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos);
}

function obtenerFabricantesParam(
    $cod_fabricante = null,
    $nombre_fabricante = null,
    $descripcion_fabricante = null,
    $cod_categoria = null,
) {
    $values = [];
    $sql = "SELECT f.* 
    FROM {{.CORE}}.fabricantes_modelo m 
	INNER JOIN {{.CORE}}.fabricantes f ON f.cod_fabricante = m.cod_fabricante WHERE 1 ";

    if ($cod_fabricante != null) {
        $sql .= "AND f.cod_fabricante = ? ";
        $values[] = $cod_fabricante;
    }

    if ($descripcion_fabricante != null) {
        $sql .= "AND f.descripcion_fabricante LIKE ? ";
        $values[] = "%$descripcion_fabricante%";
    }

    if ($cod_categoria != null) {
        $sql .= "AND m.cod_categoria  = ? ";
        $values[] = $cod_categoria;
    }

    if ($nombre_fabricante != null) {
        $sql .= "AND f.nombre_fabricante = ? ";
        $values[] = $nombre_fabricante;
    }

    $sql .= " GROUP BY f.cod_fabricante";

    try {
        $bd = obtenerConexion();
        $fab = ejecutarConsultaSQL($bd, $sql, $values, true);
        foreach ($fab as $c) {
            $c->modelos = obtenerModelosMin(
                cod_fabricante: $c->cod_fabricante,
                cod_categoria: $cod_categoria,
            );
        }
        return $fab;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerModelosMin(
    $cod_modelo = null,
    $cod_fabricante = null,
    $cod_categoria = null,
) {
    $values = [];
    $sql =
        "SELECT m.*
        FROM {{.CORE}}.fabricantes_modelo m 
        LEFT JOIN {{.CORE}}.fabricantes f ON m.cod_fabricante = f.cod_fabricante
        WHERE 1 ";

    if ($cod_fabricante != null) {
        $sql .= "AND m.cod_fabricante = ? ";
        $values[] = $cod_fabricante;
    }

    if ($cod_modelo != null) {
        $sql .= "AND m.cod_modelo = ? ";
        $values[] = $cod_modelo;
    }

    if ($cod_categoria != null) {
        $sql .= "AND m.cod_categoria = ? ";
        $values[] = $cod_categoria;
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerModelosParam(
    $cod_modelo = null,
    $nombre_modelo = null,
    $descripcion_modelo = null,
    $cod_fabricante = null,
    $cod_categoria = null,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT m.*, f.nombre_fabricante, c.nombre_categoria
        FROM {{.CORE}}.fabricantes_modelo m 
        LEFT JOIN {{.CORE}}.fabricantes f ON m.cod_fabricante = f.cod_fabricante
        LEFT JOIN {{.CORE}}.fabricantes_categoria c ON m.cod_categoria = c.cod_categoria
        WHERE 1 ";

    if ($cod_fabricante != null) {
        $sql .= "AND m.cod_fabricante = ? ";
        $values[] = $cod_fabricante;
    }

    if ($cod_modelo != null) {
        $sql .= "AND m.cod_modelo = ? ";
        $values[] = $cod_modelo;
    }

    if ($nombre_modelo != null) {
        $sql .= "AND m.nombre_modelo = ? ";
        $values[] = $nombre_modelo;
    }

    if ($descripcion_modelo != null) {
        $sql .= "AND m.descripcion_modelo  LIKE ? ";
        $values[] = "%$descripcion_modelo%";
    }

    if ($cod_categoria != null) {
        $sql .= "AND m.cod_categoria = ? ";
        $values[] = $cod_categoria;
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function insertarModelos($nombre_modelo, $foto_modelo, $descripcion_modelo, $cod_fabricante, $cod_categoria)
{
    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.fabricantes_modelo";
    $datos = [
        "nombre_modelo" => $nombre_modelo,
        "foto_modelo" => $foto_modelo,
        "descripcion_modelo" => $descripcion_modelo,
        "cod_fabricante" => $cod_fabricante,
        "cod_categoria" => $cod_categoria,
    ];
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos);
}

function modificarModelos(
    $cod_modelo = null,
    $nombre_modelo = null,
    $foto_modelo = null,
    $descripcion_modelo = null,
    $cod_fabricante = null,
    $cod_categoria = null,
) {
    if ($cod_modelo == null) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.fabricantes_modelo";
    $datos = [
        "nombre_modelo" => $nombre_modelo,
        "foto_modelo" => $foto_modelo,
        "descripcion_modelo" => $descripcion_modelo,
        "cod_fabricante" => $cod_fabricante,
        "cod_categoria" => $cod_categoria,
    ];
    $datos_condicionales = [
        "cod_modelo" => $cod_modelo,
    ];
    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

function modificarFabricantes(
    $cod_fabricante = null,
    $nombre_fabricante = null,
    $logo_fabricante = null,
    $descripcion_fabricante = null,
) {
    if ($cod_fabricante == null) {
        return false;
    }

    $bd = obtenerConexion();

    $nombre_tabla = "{{.CORE}}.fabricantes";
    $datos = [
        "nombre_fabricante" => $nombre_fabricante,
        "logo_fabricante" => $logo_fabricante,
        "descripcion_fabricante" => $descripcion_fabricante,
    ];
    $datos_condicionales = [
        "cod_fabricante" => $cod_fabricante,
    ];
    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

function eliminarModelos($cod_modelo)
{
    if ($cod_modelo == null) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.fabricantes_modelo";
    $datos_condicionales = [
        "cod_modelo" => $cod_modelo,
    ];

    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function eliminarFabricantes($cod_fabricante)
{
    if ($cod_fabricante == null) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.fabricantes";
    $datos_condicionales = [
        "cod_fabricante" => $cod_fabricante,
    ];

    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}
