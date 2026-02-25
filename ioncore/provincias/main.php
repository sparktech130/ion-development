<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

function obtenerPaisesParam(
    $nombre_pais = null,
    $iso_numerico = null,
    $alfa2 = null,
    $alfa3 = null
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = 'SELECT p.* FROM {{.CORE}}.paises p WHERE 1 ';

    if ($nombre_pais != null) {
        $sql .= 'AND p.nombre_pais LIKE ? ';
        $values[] = "%$nombre_pais%";
    }

    if ($iso_numerico != null) {
        $sql .= 'AND p.iso_numerico LIKE ? ';
        $values[] = "%$iso_numerico%";
    }

    if ($alfa2 != null) {
        $sql .= 'AND p.alfa2 LIKE ? ';
        $values[] = "%$alfa2%";
    }

    if ($alfa3 != null) {
        $sql .= 'AND p.alfa3 LIKE ? ';
        $values[] = "%$alfa3%";
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerProvinciasParam(
    $cod_provincia = null,
    $nom_provincia = null
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = 'SELECT p.* FROM {{.CORE}}.provincias p WHERE 1 ';

    if ($cod_provincia != null) {
        $sql .= 'AND p.cod_provincia = ? ';
        $values[] = $cod_provincia;
    }

    if ($nom_provincia != null) {
        $sql .= 'AND p.nom_provincia LIKE ? ';
        $values[] = "%$nom_provincia%";
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerPoblacionesParam(
    $cod_poblacion = null,
    $nom_poblacion = null,
    $cod_provincia = null
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = "SELECT p.*, pr.nom_provincia
	FROM {{.CORE}}.poblaciones p 
	LEFT JOIN {{.CORE}}.provincias pr ON p.cod_provincia = pr.cod_provincia
	WHERE 1 ";

    if ($cod_poblacion != null) {
        $sql .= 'AND p.cod_poblacion = ? ';
        $values[] = $cod_poblacion;
    }

    if ($nom_poblacion != null) {
        $sql .= 'AND p.nom_poblacion LIKE ? ';
        $values[] = "%$nom_poblacion%";
    }

    if ($cod_provincia != null) {
        $sql .= 'AND p.cod_provincia = ? ';
        $values[] = $cod_provincia;
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

