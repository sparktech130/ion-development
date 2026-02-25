<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";

function obtenerConfigUsrGrid($cod_usuario)
{
    $sql = "SELECT * 
    FROM {{.CORE}}.mto_config_usr_grid 
    WHERE cod_usuario = ?";
    $values = [$cod_usuario];
    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerGridSeleccionadoUsuario($cod_usuario, $cod_modulo, $cod_grid_exclusion = null)
{
    $sql = "SELECT ug.* 
	FROM {{.CORE}}.usuarios_grids ug
	LEFT JOIN {{.CORE}}.usuarios_grids_modulos ugm ON ug.cod_grid = ugm.cod_grid
	WHERE ugm.seleccionado = 1 ";
    $values = [];

    if ($cod_usuario) {
        $sql .= 'AND ug.cod_usuario = ? ';
        $values[] = $cod_usuario;
    }

    if ($cod_modulo) {
        $sql .= 'AND ugm.cod_modulo LIKE ? ';
        $values[] = "%$cod_modulo%";
    }

    if ($cod_grid_exclusion) {
        $sql .= 'AND ug.cod_grid != ? ';
        $values[] = $cod_grid_exclusion;
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerModulosGrid($cod_grid)
{
    $sql = "SELECT ugm.cod_modulo, ugm.seleccionado
	FROM {{.CORE}}.usuarios_grids_modulos ugm
	WHERE ugm.seleccionado = 1 ";
    $values = [];

    if ($cod_grid) {
        $sql .= 'AND ugm.cod_grid = ? ';
        $values[] = $cod_grid;
    }

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerGridsUsuario($cod_usuario, $cod_modulo = null, $cod_modulo_dispositivos = null, $cod_sector = null)
{
    $values = [$cod_usuario];
    $where = 'WHERE ug.cod_usuario = ? ';

    if ($cod_modulo) {
        $where .= 'AND m.cod_modulo = ? ';
        $values[] = $cod_modulo;
        $campos = 'ug.*, ugm.seleccionado';
    } else {
        $campos = 'ug.*, ugm.*';
    }

    if ($cod_sector) {
        $where .= 'AND m.cod_sector = ? ';
        $values[] = $cod_sector;
    }

    $sql = "SELECT $campos
	FROM {{.CORE}}.usuarios_grids ug
	LEFT JOIN {{.CORE}}.usuarios_grids_modulos ugm ON ug.cod_grid = ugm.cod_grid
	LEFT JOIN {{.CORE}}.modulos m ON m.cod_modulo = ugm.cod_modulo
    LEFT JOIN {{.CORE}}.sectores_verticales sv ON m.cod_sector = sv.cod_sector
	$where
	ORDER BY ug.cod_grid ASC";

    try {
        $bd = obtenerConexion();
        $grids = ejecutarConsultaSQL($bd, $sql, $values, true);

        foreach ($grids as $g) {
            $dispositivos = explode(';', $g->dispositivos);
            foreach ($dispositivos as $key => $cod_dispositivo) {
                $modulos = obtenerModulosDispositivosParam($cod_dispositivo, true, $cod_sector);

                if (
                    empty($modulos) ||
                    ($cod_modulo_dispositivos && empty(array_filter($modulos, function ($mod) use ($cod_modulo_dispositivos) {
                        return (int) $mod->cod_modulo === $cod_modulo_dispositivos;
                    })))
                ) {
                    unset($dispositivos[$key]);
                }
            }
            $g->dispositivos = implode(';', $dispositivos);
        }
        return $grids;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function insertarGridUsuarios($nombre_grid, $cod_usuario, $dispositivos, $modulos)
{
    if (!$nombre_grid || !$cod_usuario || !$dispositivos)
        return false;

    $nombre_tabla = "{{.CORE}}.usuarios_grids";

    $datos_tabla = [
        'nombre_grid' => $nombre_grid,
        'cod_usuario' => $cod_usuario,
        'dispositivos' => $dispositivos
    ];

    $bd = obtenerConexion();
    $insert = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, true);

    if (!$insert || isset($insert['error']))
        return $insert;

    establecerModulosGrid($insert, $modulos, $cod_usuario);

    return $insert !== false ? true : $insert;
}

function obtenerUsuarioGrid($cod_grid)
{
    if (!$cod_grid)
        return false;

    $sql = "SELECT ug.* 
	FROM {{.CORE}}.usuarios_grids ug
	WHERE 1 ";
    $values = [];

    if ($cod_grid) {
        $sql .= 'AND ug.cod_grid = ? ';
        $values[] = $cod_grid;
    }

    try {
        $bd = obtenerConexion();
        $grid = ejecutarConsultaSQL($bd, $sql, $values, true);

        if (!empty($grid)) {
            return $grid[0]->cod_usuario;
        }
        return $grid;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function modificarGridUsuarios(
    $cod_grid,
    $nombre_grid,
    $cod_usuario,
    $dispositivos,
    $modulos
) {
    if (
        !$cod_grid &&
        !($nombre_grid || $cod_usuario || $dispositivos || $modulos)
    )
        return false;

    $nombre_tabla = "{{.CORE}}.usuarios_grids";

    $datos_tabla = [
        'nombre_grid' => $nombre_grid,
        'cod_usuario' => $cod_usuario,
        'dispositivos' => $dispositivos
    ];

    $datos_condicionales = [
        'cod_grid' => [
            'operador' => 'EQ',
            'valor' => $cod_grid
        ]
    ];

    $bd = obtenerConexion();
    $update = modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);

    if ((!$update || isset($update['error']) && !$modulos || !is_array($modulos)))
        return $update;

    if (!$cod_usuario)
        $cod_usuario = obtenerUsuarioGrid($cod_grid);

    establecerModulosGrid($cod_grid, $modulos, $cod_usuario);

    return $update;
}

function comprobarModulosGridsSeleccionadosUsuario($cod_usuario)
{
    $modulos_seleccionados = obtenerModulosGridsUsuario($cod_usuario);

    if (!empty($modulos_seleccionados)) {
        foreach ($modulos_seleccionados as $mod) {
            if ($mod->modulos_seleccionados < 1) {
                seleccionarGridModulo($mod->cod_grid, $mod->cod_modulo);
            }
        }
    }
}

function obtenerModulosGridsUsuario($cod_usuario)
{
    if (!$cod_usuario)
        return false;

    $sql = "SELECT ugm.*, COUNT(CASE WHEN seleccionado = 1 THEN ugm.cod_modulo END) as modulos_seleccionados 
	FROM {{.CORE}}.usuarios_grids_modulos ugm
	LEFT JOIN {{.CORE}}.usuarios_grids ug ON ugm.cod_grid = ug.cod_grid
	WHERE 1 ";
    $values = [];

    if ($cod_usuario) {
        $sql .= 'AND ug.cod_usuario = ? ';
        $values[] = $cod_usuario;
    }

    $sql .= 'GROUP BY ugm.cod_modulo;';

    try {
        $bd = obtenerConexion();
        $modulos = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $modulos;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function desseleccionarGrid($cod_grid, $cod_modulo)
{
    if (
        !$cod_grid || !$cod_modulo
    )
        return false;

    $nombre_tabla = "{{.CORE}}.usuarios_grids_modulos";

    $datos_tabla = [
        'seleccionado' => 0
    ];

    $datos_condicionales = [
        'cod_grid' => [
            'operador' => 'EQ',
            'valor' => $cod_grid
        ],
        'cod_modulo' => [
            'operador' => 'EQ',
            'valor' => $cod_modulo
        ]
    ];

    $bd = obtenerConexion();
    $update = modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);

    return $update;
}

function seleccionarGridModulo($cod_grid, $cod_modulo)
{
    if (
        !$cod_grid || !$cod_modulo
    )
        return false;

    $nombre_tabla = "{{.CORE}}.usuarios_grids_modulos";

    $datos_tabla = [
        'seleccionado' => 1
    ];

    $datos_condicionales = [
        'cod_grid' => [
            'operador' => 'EQ',
            'valor' => $cod_grid
        ],
        'cod_modulo' => [
            'operador' => 'EQ',
            'valor' => $cod_modulo
        ]
    ];

    $bd = obtenerConexion();
    $update = modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);

    return $update;
}

function eliminarGridUsuarios(
    $cod_grid
) {
    if (!$cod_grid)
        return false;

    $nombre_tabla = "{{.CORE}}.usuarios_grids";
    $datos_condicionales = ['cod_grid' => $cod_grid];

    $bd = obtenerConexion();
    $delete = eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);

    if ($delete) {
        $nombre_tabla = 'usuarios_grids_modulos';
        eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
    }
    return $delete;
}

function desseleccionarGridAnterior($cod_grid_nuevo, $cod_usuario, $cod_modulo)
{
    // Obtener Grid con cod_usuario = $cod_usuario y cod_grid != $cod_grid_nuevo
    $grid_anterior = obtenerGridSeleccionadoUsuario($cod_usuario, $cod_modulo, $cod_grid_nuevo);

    if (!$grid_anterior || !is_array($grid_anterior) || empty($grid_anterior))
        return true;

    // Eliminamos todos los grids que estén seleccionados anteriormente
    foreach ($grid_anterior as $grid) {
        desseleccionarGrid($grid->cod_grid, $cod_modulo);
    }

    return true;
}

function establecerModulosGrid($cod_grid, $modulos, $cod_usuario)
{
    if (!$cod_grid || !$modulos || !is_array($modulos) || empty($modulos))
        return false;

    eliminarModulosGrid($cod_grid);
    $modulos_seleccionados = [];

    foreach ($modulos as $mod) {
        $cod_modulo = $mod->cod_modulo;
        $seleccionar = $mod->seleccionar ?? false;

        if ($seleccionar) {
            if (!in_array($cod_modulo, $modulos_seleccionados)) {
                $modulos_seleccionados[] = $cod_modulo;
            } else {
                $seleccionar = false;
            }
        }

        insertarModuloGrid($cod_grid, $cod_modulo, $seleccionar, $cod_usuario);
    }
}

function insertarModuloGrid($cod_grid, $cod_modulo, $seleccionado, $cod_usuario)
{
    $nombre_tabla = "{{.CORE}}.usuarios_grids_modulos";

    $datos_tabla = [
        'cod_grid' => $cod_grid,
        'cod_modulo' => $cod_modulo,
        'seleccionado' => $seleccionado
    ];

    $bd = obtenerConexion();
    $insert = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, true);

    if (!$insert || isset($insert['error']))
        return $insert;

    if ($seleccionado)
        desseleccionarGridAnterior($cod_grid, $cod_usuario, $cod_modulo);

    return $insert;
}

function eliminarModulosGrid($cod_grid)
{
    if (!$cod_grid)
        return false;
    $nombre_tabla = "{{.CORE}}.usuarios_grids_modulos";
    $datos_condicionales = [
        'cod_grid' => $cod_grid
    ];

    $bd = obtenerConexion();
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function obtenerDispositivosGrid(
    $cod_usuario = null, 
    $cod_modulo = null, 
    $cod_grid = null,
) {
    if (!$cod_grid) {
        $cod_grid = obtenerGridSeleccionadoUsuario($cod_usuario, $cod_modulo);
        if (!empty($cod_grid)) {
            $cod_grid = $cod_grid[0]->cod_grid;
        } else
            $cod_grid = null;
    }

    $sql = "SELECT d.* 
	FROM {{.CORE}}.usuarios_grids g
	LEFT JOIN {{.CORE}}.usuarios_grids_modulos gm ON g.cod_grid = gm.cod_grid
	RIGHT JOIN {{.CORE}}.dispositivos d ON FIND_IN_SET(d.cod_dispositivo, REPLACE(g.dispositivos, ';', ',')) > 0
	WHERE g.cod_usuario = ? ";
    $values = [$cod_usuario];

    if ($cod_modulo) {
        $sql .= 'AND gm.cod_modulo = ? ';
        $values[] = $cod_modulo;
    }

    if ($cod_grid) {
        $sql .= 'AND g.cod_grid = ? ';
        $values[] = $cod_grid;
    }

    $sql .=
        "GROUP BY d.cod_dispositivo
		ORDER BY FIELD(d.cod_dispositivo, REPLACE(g.dispositivos, ';', ',')) DESC";

    try {
        $bd = obtenerConexion();
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

