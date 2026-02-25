<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

function obtenerIntegraciones(
    $cod_integracion = null,
    $nombre = null,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT 
			ig.*, tipo_ig.nombre_tipo
        FROM 
            {{.CORE}}.integracion ig
        LEFT JOIN 
            {{.CORE}}.integracion_tipo tipo_ig 
                ON ig.cod_tipo = tipo_ig.cod_tipo
		WHERE 1 ";

    if ($nombre != null) {
        $sql .= "AND ig.nombre LIKE ? ";
        $values[] = "%$nombre%";
    }

    if ($cod_integracion != null) {
        $sql .= "AND ig.cod_integracion = ? ";
        $values[] = $cod_integracion;
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}
