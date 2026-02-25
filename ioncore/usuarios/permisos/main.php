<?php
function verPermisos($userCode, $nombre_seccion = null)
{
    $select = "u.permisos";
    if ($nombre_seccion)
        $select .= ", up.cod_seccion, up.acceso, up.consultas, up.editar, up.compartir";

    $sql = "SELECT $select
	FROM {{.CORE}}.usuarios u
	LEFT JOIN {{.CORE}}.usuarios_permisos_secciones up ON u.permisos = up.cod_permiso
	LEFT JOIN {{.CORE}}.modulos_seccion s ON s.cod_seccion = up.cod_seccion
	WHERE u.cod_usuario = ? ";
    $values = [$userCode];

    if ($nombre_seccion) {
        $sql .= "AND (s.nombre_seccion = ? OR u.permisos = 1) ";
        $values[] = $nombre_seccion;
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerPermisosUsuarios(
    $cod_permiso = null, 
    $nombre_permiso = null, 
    $descripcion = null, 
    $cod_sector = null, 
    $cod_modulo = null, 
    $cod_seccion = null,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = "SELECT p.*, IFNULL(COUNT(u.cod_usuario), 0) as num_usuarios 
	FROM {{.CORE}}.usuarios_permisos p 
	LEFT JOIN {{.CORE}}.usuarios u ON p.cod_permiso = u.permisos
	WHERE 1 ";

    if ($nombre_permiso) {
        $sql .= 'AND nombre_permiso LIKE ? ';
        $values[] = "%$nombre_permiso%";
    }

    if ($descripcion) {
        $sql .= 'AND descripcion LIKE ? ';
        $values[] = "%$descripcion%";
    }

    $sql .= ' GROUP BY p.cod_permiso';

    try {
        $resultados = ejecutarConsultaSQL($bd, $sql, $values, true);
        if (count($resultados) <= 0) return [];

        $secciones = obtenerPermisosSecciones(
            cod_permiso: $cod_permiso, 
            nombre_permiso: $nombre_permiso, 
            descripcion: $descripcion, 
            cod_sector: $cod_sector,
            cod_modulo: $cod_modulo, 
            cod_seccion: $cod_seccion,
        );
        if (!is_array($secciones)) {
            return $resultados;
        }

        foreach ($resultados as $permiso) {
            $permiso->secciones = [];
            for ($i = 0; $i < count($secciones); $i++) {
                $sec = $secciones[$i];

                if ($sec->cod_permiso == $permiso->cod_permiso) {
                    unset($sec->abreviacion);
                    unset($sec->nombre_seccion);
                    unset($sec->cod_modulo);
                    unset($sec->nombre_modulo);

                    $permiso->secciones[] = $sec;
                }
            }
        }

        return $resultados;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function insertarPermisos(
    $nombre_permiso, 
    $descripcion, 
    $secciones, 
    $clouds = null,
) {
    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.usuarios_permisos";
    $datos = [
        "nombre_permiso" => $nombre_permiso,
        "descripcion" => $descripcion,
    ];

    $cod_permiso = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, true);
    if (!$cod_permiso) {
        return $cod_permiso;
    }

    if ($secciones != null && is_array($secciones) && !empty($secciones)) {
        asignarPermisosSecciones($cod_permiso, $secciones);
    }

    if ($clouds != null && is_array($clouds) && !empty($clouds)) {
        asignarPermisosClouds($cod_permiso, $clouds);
    }

    return true;
}

function modificarPermisos(
    $cod_permiso,
    $nombre_permiso = null,
    $descripcion = null,
    $secciones = null,
    $clouds = null
) {
    if ($cod_permiso == null) {
        return false;
    }

    $update = false;
    if ($secciones != null && is_array($secciones) && !empty($secciones)) {
        $update = asignarPermisosSecciones($cod_permiso, $secciones);
    }

    if ($clouds != null && is_array($clouds) && !empty($clouds)) {
        if ($update == false) {
            $update = asignarPermisosClouds($cod_permiso, $clouds);
        } else {
            asignarPermisosClouds($cod_permiso, $clouds);
        }
    }

    if ($nombre_permiso === null && $descripcion === null) { return $update; }
    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.usuarios_permisos";
    $datos = [
        "nombre_permiso" => $nombre_permiso,
        "descripcion" => $descripcion,
    ];
    $datos_condicionales = [
        "cod_permiso" => $cod_permiso,
    ];
    $update = modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);

    return $update;
}

function asignarPermisosClouds($cod_permiso, $clouds)
{
    if (!(isset($cod_permiso) && is_array($clouds) && !empty($clouds)))
        return false;

    $bd = obtenerConexion();

    eliminarPermisosClouds($cod_permiso);
    $nombre_tabla = "{{.CORE}}.usuarios_permisos_clouds";
    $datos = [
        "cod_permiso" => $cod_permiso,
        "cod_cloud" => null,
        "stream" => false,
    ];

    $datosIns = [];
    foreach ($clouds as $val) {
        if (!$val->cod_cloud) continue;

        $datosIns[] = clone $datos;

        $datosIns[-1]["cod_cloud"] = $val->cod_cloud;
        $datosIns[-1]["stream"] = $val->stream ?? false;
    }

    if (empty($datosIns)) {
        return false;
    }

    foreach ($datosIns as $rows) {
        insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $rows, false);
    }
    return true;
}

function asignarPermisosSecciones($cod_permiso, $secciones) {
    if (!(isset($cod_permiso) && is_array($secciones) && !empty($secciones)))
        return false;

    $bd = obtenerConexion();

    $values = [];
    $sql = "INSERT INTO {{.CORE}}.usuarios_permisos_secciones (cod_permiso, cod_seccion, acceso, consultas, editar, compartir) VALUES ";

    for ($i = 0; $i < count($secciones); $i++) {
        $val = $secciones[$i];

        $seccion = $val->seccion;
        eliminarPermisosSecciones($cod_permiso, $seccion);
        if (isset($val->todos)) {
            $acceso = true;
            $consultas = true;
            $editar = true;
            $compartir = true;
        } else {
            $acceso = $val->acceso ?? false;
            $consultas = $val->consultas ?? false;
            $editar = $val->editar ?? false;
            $compartir = $val->compartir ?? false;
        }

        $sql .= '(?, ?, ?, ?, ?, ?), ';
        $values[] = $cod_permiso;
        $values[] = $seccion;
        $values[] = $acceso;
        $values[] = $consultas;
        $values[] = $editar;
        $values[] = $compartir;
    }
    $sql = rtrim($sql, ', ');

    try {
        return ejecutarConsultaSQL($bd, $sql, $values);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'update', $e);
    }
}

function eliminarPermisosClouds($cod_permiso = null, $cod_cloud = null)
{
    $bd = obtenerConexion();
    if ($cod_permiso == null) {
        return false;
    }

    $nombre_tabla = "{{.CORE}}.usuarios_permisos_clouds";
    $datos_condicionales = [
        "cod_permiso" => $cod_permiso,
        "cod_cloud" => $cod_cloud,
    ];
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function eliminarPermisosSecciones($cod_permiso = null, $cod_seccion = null)
{
    $bd = obtenerConexion();
    if ($cod_permiso == null) {
        return false;
    }

    $nombre_tabla = "{{.CORE}}.usuarios_permisos_secciones";
    $datos_condicionales = [
        "cod_permiso" => $cod_permiso,
        "cod_seccion" => $cod_seccion,
    ];
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function eliminarPermisos($cod_permiso)
{
    $bd = obtenerConexion();
    if ($cod_permiso == null) {
        return false;
    }

    $nombre_tabla = "{{.CORE}}.usuarios_permisos";
    $datos_condicionales = [
        "cod_permiso" => $cod_permiso,
    ];

    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

