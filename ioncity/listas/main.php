<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/main.php";

function insertarLista(
    $cod_poblacion = null,
    $cod_provincia = null,
    $desc_lista = null,
    $nombre_lista = null,
    $tipo_alerta = null,
) {
    $nombre_tabla = "{{.CITY}}.listas";
    $datos = [
        "cod_poblacion" => $cod_poblacion,
        "cod_provincia" => $cod_provincia,
        "desc_lista" => $desc_lista,
        "nombre_lista" => $nombre_lista,
        "tipo_alerta" => $tipo_alerta,
    ];

    $bd = obtenerConexion();
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos);
}

function obtenerListasParam(
    $cod_lista = null,
    $nombre_lista = null,
    $desc_lista = null,
    $tipo_alerta = null,
    $cod_provincia = null,
    $cod_poblacion = null,
    $limit = null,
    $obtenerVehiculos = false,
) {
    $values = [];
    $where = "WHERE 1 ";

    if ($cod_lista != null) {
        $where .= 'AND l.cod_lista = ? ';
        $values[] = $cod_lista;
    }

    if ($desc_lista != null) {
        $where .= 'AND l.desc_lista LIKE ? ';
        $values[] = "%$desc_lista%";
    }

    if ($tipo_alerta != null && is_array($tipo_alerta)) {
        $tipos = '';
        foreach ($tipo_alerta as $key => $value) {
            if ($value === '' || $value === null) {
                continue;
            }

            if ($key > 0) {
                $tipos .= 'OR';
            }
            $tipos .= ' l.tipo_alerta LIKE ? ';
            $values[] = "%$value%";
        }

        $where .= "AND ($tipos) ";
    } else if ($tipo_alerta != null) {
        $where .= 'AND l.tipo_alerta LIKE ? ';
        $values[] = "%$tipo_alerta%";
    }

    if ($nombre_lista != null) {
        $where .= 'AND l.nombre_lista LIKE ? ';
        $values[] = "%$nombre_lista%";
    }

    if ($cod_provincia != null) {
        $where .= 'AND l.cod_provincia = ? ';
        $values[] = $cod_provincia;
    }

    if ($cod_poblacion != null) {
        $where .= 'AND l.cod_poblacion = ? ';
        $values[] = $cod_poblacion;
    }

    $sql = "SELECT l.*
    FROM 
        {{.CITY}}.listas l 
    {$where} ";

    if ($limit != null) {
        $sql .= 'LIMIT ?;';
        $values[] = $limit;
    }

    try {
        $bd = obtenerConexion();
        $rows = ejecutarConsultaSQL($bd, $sql, $values, true);

        if (!$obtenerVehiculos) {
            return $rows;
        }

        return array_map(
            array: $rows,
            callback: function ($lista) {
                $lista->vehiculos = obtenerVehiculosListas(
                    cod_lista: $lista->cod_lista,
                );
                return $lista;
            },
        );
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerListasCount()
{
    $values = [];
    $sql = "SELECT COUNT(l.cod_lista) as total FROM {{.CITY}}.listas l";

    try {
        $bd = obtenerConexion();
        $datos = ejecutarConsultaSQL($bd, $sql, $values, true);

        return $datos[0]->total ?? 0;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function comprobarListasNegrasMatricula($matricula)
{
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT 
        count(lv.matricula) as total,
        l.tipo_alerta,
        l.cod_lista
    FROM 
        {{.CITY}}.listas l 
    LEFT JOIN 
        {{.CITY}}.listas_vehiculos lv 
            ON l.cod_lista = lv.cod_lista
	WHERE l.desc_lista = 'n' ";

    if ($matricula != null) {
        $sql .= 'AND matricula = ? ';
        $values[] = $matricula;
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function comprobarListasBlancasMatricula($matricula)
{
    $bd = obtenerConexion();
    $values = [];
    $sql = "SELECT 
        count(lv.matricula) as total,
        l.tipo_alerta,
        l.cod_lista
    FROM 
        {{.CITY}}.listas l 
    LEFT JOIN 
        {{.CITY}}.listas_vehiculos lv 
            ON l.cod_lista = lv.cod_lista
	WHERE l.desc_lista = 'b' ";

    if ($matricula != null) {
        $sql .= 'AND matricula = ? ';
        $values[] = $matricula;
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

/**
 * Comprueba una matrícula contra todas las listas (negras y blancas)
 * 
 * Retorna listas que deben generar alerta:
 * - Listas negras donde la matrícula ESTÁ
 * - Listas blancas donde la matrícula NO ESTÁ
 * 
 * @param string $matricula Matrícula a comprobar
 * @return array Array de objetos con información de las listas que alertan
 */
function comprobarMatriculaContraTodasListas($matricula)
{
    if (!$matricula) {
        return [];
    }

    $bd = obtenerConexion();
    $values = [$matricula, $matricula];

    // UNION de dos queries:
    // 1. Listas negras donde la matrícula ESTÁ
    // 2. Listas blancas donde la matrícula NO ESTÁ
    $sql = "
        SELECT 
            l.cod_lista,
            l.nombre_lista,
            l.desc_lista,
            l.tipo_alerta,
            'en_lista_negra' as motivo
        FROM {{.CITY}}.listas l
        INNER JOIN {{.CITY}}.listas_vehiculos lv ON l.cod_lista = lv.cod_lista
        WHERE l.desc_lista = 'n' AND lv.matricula = ?
        
        UNION
        
        SELECT 
            l.cod_lista,
            l.nombre_lista,
            l.desc_lista,
            l.tipo_alerta,
            'no_en_lista_blanca' as motivo
        FROM {{.CITY}}.listas l
        WHERE l.desc_lista = 'b'
        AND NOT EXISTS (
            SELECT 1 
            FROM {{.CITY}}.listas_vehiculos lv 
            WHERE lv.cod_lista = l.cod_lista AND lv.matricula = ?
        )
    ";

    try {
        $resultado = ejecutarConsultaSQL($bd, $sql, $values, true);

        if (!empty($resultado)) {
            EscribirLog(
                "Matrícula {$matricula}: " . count($resultado) . " lista(s) generan alerta",
                "info"
            );
        }

        return $resultado ?? [];
    } catch (PDOException $e) {
        EscribirLog(
            "Error al comprobar matrícula {$matricula} contra todas las listas: " . $e->getMessage(),
            "error"
        );
        return [];
    }
}

function modificarLista(
    $cod_lista = null,
    $cod_poblacion = null,
    $cod_provincia = null,
    $desc_lista = null,
    $nombre_lista = null,
    $tipo_alerta = null,
) {
    if (!$cod_lista)
        return false;

    $nombre_tabla = '{{.CITY}}.listas';
    $datos_tabla = [
        'cod_poblacion' => $cod_poblacion,
        'cod_provincia' => $cod_provincia,
        'desc_lista' => $desc_lista,
        'nombre_lista' => $nombre_lista,
        'tipo_alerta' => $tipo_alerta,
    ];
    $datos_condicionales = [
        'cod_lista' => $cod_lista
    ];

    $bd = obtenerConexion();
    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

function eliminarLista($cod_lista = null)
{
    if ($cod_lista == null) {
        return false;
    }

    $nombre_tabla = '{{.CITY}}.listas';
    $datos_condicionales = [
        'cod_lista' => $cod_lista
    ];

    $bd = obtenerConexion();
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

// ===== Vehiculos listas =====
function insertarVehiculosListas(
    $cod_lista = null,
    $matricula = null,
    $descripcion_vehiculo = null,
) {
    $bd = obtenerConexion();

    $nombre_tabla = "{{.CITY}}.listas_vehiculos";
    $datos = [
        "cod_lista" => $cod_lista,
        "matricula" => $matricula,
        "descripcion_vehiculo" => $descripcion_vehiculo,
    ];

    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos);
}

function importarVehiculosLista($archivo_csv, $cod_lista)
{
    if (!$cod_lista) {
        return false;
    }
    // Lee el encabezado del archivo CSV
    $header = fgetcsv($archivo_csv);

    // Índices de los campos necesarios
    $matricula_index = array_search('matricula', $header);
    $descripcion_vehiculo_index = array_search('descripcion_vehiculo', $header);

    $matriculasInsert = [];
    $matriculasFail = [];

    // Filas del archivo CSV
    while (($row = fgetcsv($archivo_csv)) !== false) {
        $matricula = $row[$matricula_index];
        $descripcion_vehiculo = $row[$descripcion_vehiculo_index];

        // Comprobación de si existe o no
        $matriculas = obtenerVehiculosListas(
            cod_lista: $cod_lista,
            matricula: $matricula,
        );

        if (!empty($matriculas) && count($matriculas) === 1) {
            modificarVehiculosListas(
                matricula: $matricula,
                descripcion_vehiculo: $descripcion_vehiculo,
                cod_vehic_lista: $matriculas[0]->cod_vehic_lista,
                cod_lista: $cod_lista,
            );
            continue;
        }

        $insert = true;
        foreach ($matriculasInsert as $m) {
            if ($m === $matricula) {
                $insert = false;
                break;
            }
        }

        if ($insert === true) {
            $ins = insertarVehiculosListas(
                cod_lista: $cod_lista,
                matricula: $matricula,
                descripcion_vehiculo: $descripcion_vehiculo,
            );

            if ($ins === true) {
                $matriculasInsert[] = $matricula;
                continue;
            }

            $matriculasFail[] = $matricula;
            continue;
        }
    }

    return [
        'insert' => $matriculasInsert,
        'errors' => $matriculasFail
    ];
}


function obtenerVehiculosListas(
    $cod_lista = null,
    $matricula = null,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = 'SELECT * FROM {{.CITY}}.listas_vehiculos WHERE 1 ';

    if ($cod_lista != null) {
        $sql .= 'AND cod_lista = ? ';
        $values[] = $cod_lista;
    }

    if ($matricula != null) {
        $sql .= 'AND matricula LIKE ? ';
        $values[] = "%$matricula%";
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerVehiculosListasCount(
    $cod_lista = null,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = 'SELECT COUNT(cod_lista) as total 
    FROM {{.CITY}}.listas_vehiculos lv WHERE 1 ';

    if ($cod_lista != null) {
        $sql .= 'AND lv.cod_lista = ? ';
        $values[] = $cod_lista;
    }

    try {
        $datos = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $datos[0]->total ?? 0;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function modificarVehiculosListas(
    $cod_vehic_lista,
    $cod_lista = null,
    $matricula = null,
    $descripcion_vehiculo = null,
) {
    if ($cod_vehic_lista == null) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.listas_vehiculos";
    $datos = [
        "cod_lista" => $cod_lista,
        "matricula" => $matricula,
        "descripcion_vehiculo" => $descripcion_vehiculo,
    ];
    $datos_condicionales = [
        "cod_vehic_lista" => $cod_vehic_lista,
    ];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

function eliminarVehiculosListas(
    $cod_vehic_lista = null,
    $cod_lista = null,
) {
    if ($cod_vehic_lista == null && $cod_lista == null) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.listas_vehiculos";
    $datos_condicionales = [
        "cod_lista" => $cod_lista,
        "cod_vehic_lista" => $cod_vehic_lista,
    ];

    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function eliminarVehiculosListasMatricula(
    $matricula = null,
    $cod_lista = null,
) {
    if ($matricula == null && $cod_lista == null) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.listas_vehiculos";
    $datos_condicionales = [
        "cod_lista" => $cod_lista,
        "matricula" => $matricula,
    ];

    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

// ===== Destinatarios de listas =====

/**
 * Inserta un destinatario para una lista específica
 * 
 * @param int $cod_lista Código de la lista
 * @param string $canal Canal de notificación: 'email', 'sms', 'whatsapp'
 * @param string $destinatario Email, teléfono o ID según canal
 * @param string|null $nombre Nombre del destinatario (opcional)
 *
 * @return bool|array True si se insertó correctamente, array de error si falló
 */
function insertarDestinatarioLista(
    $cod_lista = null,
    $canal = 'email',
    $destinatario = null,
    $nombre = null,
) {
    if (!$cod_lista || !$destinatario) {
        return false;
    }

    if ($canal === "email" && !filter_var($destinatario, FILTER_VALIDATE_EMAIL)) {
        return [
            "message" => "El mail es inválido",
            "error" => true,
        ];
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.listas_destinatarios";
    $datos = [
        "cod_lista" => $cod_lista,
        "canal" => $canal,
        "destinatario" => $destinatario,
        "nombre" => $nombre,
    ];

    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, true);
}

function importarDestinatariosLista($archivo_csv, $cod_lista)
{
    if (!$cod_lista) {
        return false;
    }
    // Lee el encabezado del archivo CSV
    $header = fgetcsv($archivo_csv);

    // Índices de los campos necesarios
    $canal_index = array_search('canal', $header);
    $nombre_index = array_search('nombre', $header);
    $destinatario_index = array_search('destinatario', $header);

    $destInsert = [];
    $destFail = [];

    $destinatariosLista = obtenerDestinatariosLista(cod_lista: $cod_lista);
    // Filas del archivo CSV
    while (($row = fgetcsv($archivo_csv)) !== false) {
        $canal = $row[$canal_index];
        $nombre = $row[$nombre_index];
        $destinatario = $row[$destinatario_index];

        // Comprobación de si existe o no
        $dest = array_filter(
            array: $destinatariosLista,
            callback: function ($d) use ($destinatario) {
                return $d == $destinatario;
            },
        );
        if (!empty($dest) && count($dest) >= 1) {
            $d = $dest[0];

            modificarDestinatarioLista(
                id: $d->id,
                canal: $canal,
                nombre: $nombre,
                destinatario: $destinatario,
            );
            continue;
        }

        $insert = true;
        foreach ($destInsert as $d) {
            if ($d === $destinatario) {
                $insert = false;
                break;
            }
        }

        if ($insert === true) {
            $ins = insertarDestinatarioLista(
                cod_lista: $cod_lista,
                canal: $canal,
                nombre: $nombre,
                destinatario: $destinatario,
            );

            if ($ins === true) {
                $destInsert[] = $destinatario;
                continue;
            }

            $destFail[] = $destinatario;
            continue;
        }
    }

    return [
        'insert' => $destInsert,
        'errors' => $destFail
    ];
}

/**
 * Obtiene los destinatarios de una lista específica
 * 
 * @param int|null $cod_lista Código de la lista
 * @param int|null $id ID específico del destinatario
 * @param string|null $destinatario mail o telefono
 * @param string|null $nombre Nombre del destinatario
 * @param string|null $canal Filtrar por canal específico
 * @param bool $soloActivos Si true, devuelve solo destinatarios activos
 *
 * @return array Lista de destinatarios
 */
function obtenerDestinatariosLista(
    $cod_lista = null,
    $id = null,
    $destinatario = null,
    $nombre = null,
    $canal = null,
    $soloActivos = true,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = 'SELECT * FROM {{.CITY}}.listas_destinatarios WHERE 1 ';

    if ($id != null) {
        $sql .= 'AND id = ? ';
        $values[] = $id;
    }

    if ($cod_lista != null) {
        $sql .= 'AND cod_lista = ? ';
        $values[] = $cod_lista;
    }

    if ($destinatario != null) {
        $sql .= 'AND destinatario LIKE ? ';
        $values[] = "%$destinatario%";
    }

    if ($nombre != null) {
        $sql .= 'AND nombre LIKE ? ';
        $values[] = "%$nombre%";
    }

    if ($canal != null) {
        $sql .= 'AND canal = ? ';
        $values[] = $canal;
    }

    if ($soloActivos) {
        $sql .= 'AND activo = 1 ';
    }

    $sql .= 'ORDER BY creado_en DESC';

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

/**
 * Obtiene los destinatarios asociados a una matrícula específica
 * mediante la relación: matrícula -> listas_vehiculos -> listas -> listas_destinatarios
 * Solo devuelve destinatarios activos para envío de notificaciones
 * 
 * @param string $matricula Matrícula del vehículo
 * @return array Lista de destinatarios con información de la lista
 */
function obtenerDestinatariosPorMatricula($matricula = null)
{
    if (!$matricula) {
        return [];
    }

    $bd = obtenerConexion();
    $values = [$matricula, $matricula];

    // UNION de dos queries:
    // 1. Destinatarios de listas negras donde la matrícula ESTÁ
    // 2. Destinatarios de listas blancas donde la matrícula NO ESTÁ
    $sql = "
        SELECT 
            ld.id,
            ld.cod_lista,
            ld.nombre,
            ld.canal,
            ld.destinatario,
            ld.activo,
            l.nombre_lista,
            l.desc_lista,
            l.tipo_alerta,
            'en_lista_negra' as motivo
        FROM 
            {{.CITY}}.listas_vehiculos lv
        INNER JOIN 
            {{.CITY}}.listas l ON lv.cod_lista = l.cod_lista
        INNER JOIN 
            {{.CITY}}.listas_destinatarios ld ON l.cod_lista = ld.cod_lista
        WHERE 
            lv.matricula = ?
            AND l.desc_lista = 'n'
            AND ld.activo = 1
            
        UNION
        
        SELECT 
            ld.id,
            ld.cod_lista,
            ld.nombre,
            ld.canal,
            ld.destinatario,
            ld.activo,
            l.nombre_lista,
            l.desc_lista,
            l.tipo_alerta,
            'no_en_lista_blanca' as motivo
        FROM 
            {{.CITY}}.listas l
        INNER JOIN 
            {{.CITY}}.listas_destinatarios ld ON l.cod_lista = ld.cod_lista
        WHERE 
            l.desc_lista = 'b'
            AND ld.activo = 1
            AND NOT EXISTS (
                SELECT 1 
                FROM {{.CITY}}.listas_vehiculos lv 
                WHERE lv.cod_lista = l.cod_lista AND lv.matricula = ?
            )
            
        ORDER BY 
            cod_lista, canal";

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

/**
 * Modifica un destinatario existente
 * 
 * @param int $id ID del destinatario
 * @param string|null $canal Canal de notificación
 * @param string|null $destinatario Email, teléfono o ID
 * @param string|null $nombre Nombre del destinatario
 * @param int|null $activo Estado del destinatario (1 = activo, 0 = inactivo)
 * @return bool True si se modificó correctamente
 */
function modificarDestinatarioLista(
    $id = null,
    $canal = null,
    $destinatario = null,
    $nombre = null,
    $activo = null,
) {
    if (!$id) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.listas_destinatarios";
    $datos = [
        "canal" => $canal,
        "destinatario" => $destinatario,
        "nombre" => $nombre,
        "activo" => $activo,
    ];
    $datos_condicionales = [
        "id" => $id,
    ];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

/**
 * Cambia el estado de un destinatario (activar/desactivar)
 * 
 * @param int $id ID del destinatario
 * @param int $activo Estado a establecer (1 = activo, 0 = inactivo)
 * @return bool True si se modificó correctamente
 */
function cambiarEstadoDestinatario($id = null, $activo = 1)
{
    if (!$id) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.listas_destinatarios";
    $datos = [
        "activo" => $activo ? 1 : 0,
    ];
    $datos_condicionales = [
        "id" => $id,
    ];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

/**
 * Elimina un destinatario de una lista
 * 
 * @param int|null $id ID del destinatario
 * @param int|null $cod_lista Código de la lista (elimina todos los destinatarios de la lista)
 * @return bool True si se eliminó correctamente
 */
function eliminarDestinatarioLista(
    $id = null,
    $cod_lista = null,
) {
    if (!$id && !$cod_lista) {
        return false;
    }

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CITY}}.listas_destinatarios";
    $datos_condicionales = [
        "id" => $id,
        "cod_lista" => $cod_lista,
    ];

    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}
