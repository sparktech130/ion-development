<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";

// TODO: Gestionar todo esto en el cloud
function obtenerCodCliente($nombre_cliente = null, $servidor = null) {
    if ($nombre_cliente == null && $servidor == null)
        return null;

    $bd = obtenerConexionIonSmart();
    $values = [];
    $sql = "SELECT cod_cliente FROM {$_SESSION["IONSMART_DATABASE"]}.licencias_clientes WHERE 1 ";

    if ($nombre_cliente != null) {
        $sql .= "AND nombre_cliente LIKE ? ";
        $values[] = "%$nombre_cliente%";
    }

    if ($servidor != null) {
        $sql .= "AND servidor = ? ";
        $values[] = $servidor;
    }

    try {
        $resultados = ejecutarConsultaSQL($bd, $sql, $values, true);
        if ($resultados) {
            return $resultados[0]->cod_cliente ?? null;
        }

        return null;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerLicencia($clave_licencia) {
    $bd = obtenerConexionIonSmart();

    $sql = "SELECT * FROM {$_SESSION["IONSMART_DATABASE"]}.licencias WHERE clave_licencia = ?";

    try {
        return ejecutarConsultaSQL($bd, $sql, [$clave_licencia], true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e, false);
    }
}

function agregarLicenciaUsuario($clave_licencia) {
    $result = obtenerLicencia($clave_licencia);

    if (!($result && !empty($result) && !isset($result["error"]))) {
        return [
            "message" => "La clave de licencia no existe",
            "error" => true,
        ];
    } 

    $estado_licencia = $result[0]->estado ?? null;

    $duracion_dias = $result[0]->duracion_dias;

    $obj = match ($estado_licencia) {
        ESTADOS_LICENCIA["ESTADO_LICENCIA_VALIDA"] => activarClaveLicenciaUsuario($clave_licencia, $duracion_dias),
        ESTADOS_LICENCIA["ESTADO_LICENCIA_EXPIRADA"] => ["message" => "La clave de licencia ha expirado", "error" => true],
        ESTADOS_LICENCIA["ESTADO_LICENCIA_ENUSO"] => ["message" => "La clave de licencia ya esta en uso", "error" => true],
        default => ["message" => "La clave de licencia no existe", "error" => true]
    };

    if (isset($obj["error"]) && $obj["error"] === true)
        http_response_code(500);

    return $obj;
}

function activarClaveLicenciaUsuario($clave_licencia, $duracion_dias = null) {
    $bd = obtenerConexionIonSmart();

    $cod_cliente = obtenerCodCliente(servidor: $_ENV["ION_SERVER"]);

    $fecha_activacion = date("Y-m-d H:i:s", time());
    $fecha2 = new DateTime($fecha_activacion);  // crea un objeto DateTime
    $fecha2->setTimezone(TIME_ZONE);

    // Añade un año a la fecha
    if ($duracion_dias != null && $duracion_dias > 0) {
        $fecha2->add(new DateInterval("P{$duracion_dias}D"));  // "P{x}D" representa un período x días
        $fecha_expiracion = $fecha2->format("Y-m-d H:i:s");
    }

    $nombre_tabla = "{$_SESSION["IONSMART_DATABASE"]}.licencias";
    $campos = [
        "estado" => ESTADOS_LICENCIA["ESTADO_LICENCIA_ENUSO"],
        "fecha_activacion" => $fecha_activacion,
        "fecha_expiracion" => $fecha_expiracion ?? null,
        "cod_cliente" => $cod_cliente,
    ];
    $campos_condicionales = [
        "clave_licencia" => $clave_licencia,
    ];

    try {
        return modificarDatosTabla( $bd, __FUNCTION__, $nombre_tabla, $campos, $campos_condicionales );
    } catch (PDOException $e) {
        http_response_code(500);
        return array(
            "message" => "Error al activar licencia: " . $e->getMessage(),
            "error" => true
        );
    }
}

function obtenerLicenciasCliente(
    $servidor = null,
    $estado = null,
    $cod_sector = null,
) {
    $values = [];
    $sql =
        "SELECT 
			l.fecha_activacion, 
			l.fecha_expiracion, 
            l.duracion_dias,
			l.canales, 
			m.cod_sector,
			l.cod_modulo,
            l.estado
		FROM {$_SESSION["IONSMART_DATABASE"]}.licencias l
		LEFT JOIN {$_SESSION["IONSMART_DATABASE"]}.modulos m ON l.cod_modulo = m.cod_modulo 
		LEFT JOIN {$_SESSION["IONSMART_DATABASE"]}.modulos_seccion s ON s.cod_seccion = l.seccion 
		LEFT JOIN {$_SESSION["IONSMART_DATABASE"]}.licencias_clientes lc ON l.cod_cliente = lc.cod_cliente
		WHERE 1 ";

    if ($servidor != null) {
        $sql .= "AND lc.servidor = ? ";
        $values[] = $servidor;
    }

    if ($estado != null)
        if (is_array($estado) && !empty($estado)) {
            $sql .= "AND (";
            foreach ($estado as $e) {
                $sql .= "l.estado LIKE ? OR ";
                $values[] = "%$e%";
            }
            $sql = rtrim($sql, "OR ") . ") ";
        } else {
            $sql .= "AND l.estado = ? ";
            $values[] = $estado;
        }

    if ($cod_sector != null) {
        $sql .= "AND m.cod_sector = ? ";
        $values[] = $cod_sector;
    }

    try {
        $bd = obtenerConexionIonSmart();
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerCoordenadasCliente(
    $cod_cliente = null,
    $servidor = null,
) {
    $values = [];
    $sql =
        "SELECT 
            lc.cod_cliente, lc.coordenadas
		FROM {$_SESSION["IONSMART_DATABASE"]}.licencias_clientes lc 
		WHERE 1 ";

    if ($cod_cliente != null) {
        $sql .= "AND lc.cod_cliente = ? ";
        $values[] = $cod_cliente;
    }

    if ($servidor != null) {
        $sql .= "AND lc.servidor = ? ";
        $values[] = $servidor;
    }

    try {
        $bd = obtenerConexionIonSmart();
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerCanalesModulos($servidor_cliente, $cod_modulo = null)
{
    $values = [];
    $licencia_prorroga = ESTADOS_LICENCIA["ESTADO_LICENCIA_PRORROGA"];
    $licencia_enuso = ESTADOS_LICENCIA["ESTADO_LICENCIA_ENUSO"];

    $sql =
        "SELECT 
			CAST(IFNULL(
            SUM(
                CASE WHEN l.estado = '{$licencia_enuso}' OR l.estado = '{$licencia_prorroga}' 
                    THEN l.canales
                    ELSE 0
                END
            ), 0) AS INT) as canales_totales,
			CAST(
                IFNULL(
                    SUM(
                        CASE 
                            WHEN l.estado = 'EN USO' THEN l.canales
                            ELSE NULL
                        END
                    ), 
                0) 
            AS INT) as canales_validos,
			m.cod_sector,
			l.cod_modulo,
            m.nombre_modulo
		FROM {$_SESSION["IONSMART_DATABASE"]}.licencias l
		LEFT JOIN {$_SESSION["IONSMART_DATABASE"]}.modulos m ON l.cod_modulo = m.cod_modulo 
		LEFT JOIN {$_SESSION["IONSMART_DATABASE"]}.licencias_clientes lc ON l.cod_cliente = lc.cod_cliente
		WHERE (l.fecha_expiracion > CURRENT_DATE OR l.fecha_expiracion IS NULL OR l.estado = '{$licencia_prorroga}') ";

    if ($servidor_cliente != null) {
        $sql .= "AND lc.servidor = ? ";
        $values[] = $servidor_cliente;
    }

    if ($cod_modulo != null) {
        $sql .= "AND l.cod_modulo = ? ";
        $values[] = $cod_modulo;
    }

    $sql .= " GROUP BY l.cod_modulo";

    try {
        $bd = obtenerConexionIonSmart();
        $modulos = ejecutarConsultaSql($bd, $sql, $values, true);

        foreach ($modulos as $mod) {
            $mod->canales_en_uso = obtenerDispositivosModuloCount(
                cod_modulo: $mod->cod_modulo,
                estado_canal: ESTADOS_CANALES["ESTADO_ACTIVO"],
            )[0]->total ?? 0;

            $mod->dispositivos_prorroga = obtenerDispositivosModulo(
                cod_modulo: $mod->cod_modulo,
                estado_canal: ESTADOS_CANALES["ESTADO_PRORROGA"],
            ) ?? [];

            $mod->dispositivos_asignados = obtenerDispositivosModuloCount(
                $mod->cod_modulo
            )[0]->total ?? 0;
        }

        return $modulos;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function cambiarEstadoLicenciasServidor($servidor)
{
    if ($servidor === $_ENV["ION_SERVER"]) {
        require_once $_SERVER["DOCUMENT_ROOT"] . "/core/licencias/cambiarEstadoLicencias.php";
    } else {
        $url = "{$servidor}/core/licencias/cambiarEstadoLicencias.php";
        return llamadaCurl($url, null);
    }
}

function obtenerLicenciasParam(
    $clave_licencia = null,
    $nombre_modulo = null,
    $seccion = null,
    $cod_sector = null,
    $canales = null,
    $estado = null,
    $nombre_cliente = null,
    $servidor = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $fecha_expiracion_fin = null,
    $fecha_mayor = null
) {
    $values = [];
    $sql =
        "SELECT 
		l.cod_licencia,
		l.clave_licencia, 
		l.estado, 
		l.fecha_activacion, 
		l.fecha_expiracion, 
        l.duracion_dias,
		l.canales, 
		m.cod_sector,
		l.cod_modulo, 
		m.abreviacion as abreviacion_modulo, 
		m.nombre_modulo as modulo, 
		s.abreviacion as abreviacion_seccion, 
		s.nombre_seccion,
		lc.nombre_cliente
	FROM {$_SESSION["IONSMART_DATABASE"]}.licencias l
	LEFT JOIN {$_SESSION["IONSMART_DATABASE"]}.modulos m ON l.cod_modulo = m.cod_modulo 
	LEFT JOIN {$_SESSION["IONSMART_DATABASE"]}.modulos_seccion s ON s.cod_seccion = l.seccion 
	LEFT JOIN {$_SESSION["IONSMART_DATABASE"]}.licencias_clientes lc ON l.cod_cliente = lc.cod_cliente
	WHERE 1 ";

    if ($clave_licencia != null) {
        $sql .= "AND l.clave_licencia = ? ";
        $values[] = "$clave_licencia";
    }

    if ($nombre_modulo != null) {
        $sql .= "AND m.nombre_modulo LIKE ? ";
        $values[] = "%$nombre_modulo%";
    }

    if ($nombre_cliente != null) {
        $sql .= "AND lc.nombre_cliente LIKE ? ";
        $values[] = "%$nombre_cliente%";
    }

    if ($servidor != null) {
        $sql .= "AND lc.servidor = ? ";
        $values[] = "$servidor";
    }

    if ($fecha_ini != null && $fecha_fin != null) {
        $sql .= "AND (DATE(l.fecha_activacion) BETWEEN ? AND ? OR DATE(l.fecha_expiracion) BETWEEN ? AND ? ";

        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
        $values[] = $fecha_ini;
        $values[] = $fecha_fin;
    }

    if ($fecha_expiracion_fin != null) {
        $sql .= "AND CAST(l.fecha_expiracion AS DATE) < ? ";

        $values[] = $fecha_expiracion_fin;
    }

    if ($fecha_mayor != null) {
        $sql .= "AND CAST(l.fecha_expiracion AS DATE) > ? ";

        $values[] = $fecha_mayor;
    }

    if ($seccion != null) {
        $sql .= "AND s.seccion LIKE ? ";
        $values[] = "%$seccion%";
    }

    if ($cod_sector != null) {
        $sql .= "AND m.cod_sector = ? ";
        $values[] = "$cod_sector";
    }

    if ($canales != null) {
        $sql .= "AND l.canales = ? ";
        $values[] = "$canales";
    }

    if ($estado != null) {
        if (is_array($estado)) {
            $strEstados = "";
            foreach ($estado as $key => $value) {
                if ($value != "") {
                    if ($key > 0) {
                        $strEstados .= "OR";
                    }
                    $strEstados .= " l.estado LIKE ? ";
                    $values[] = "%$value%";
                }
            }

            $sql .= " AND ($strEstados) ";
        } else {
            $sql .= "AND l.estado LIKE ? ";
            $values[] = "%$estado%";
        }
    }

    try {
        $bd = obtenerConexionIonSmart();
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function prorrogarLicencias($licencias) {
    if (!(is_array($licencias) && !empty($licencias)))
        return false;

    $licenciasArr = [];
    foreach ($licencias as $lic)
        $licenciasArr[] = $lic->cod_licencia;

    $nombre_tabla = "{$_SESSION["IONSMART_DATABASE"]}.licencias";
    $datos_tabla = [
        "estado" => ESTADOS_LICENCIA["ESTADO_LICENCIA_PRORROGA"]
    ];
    $datos_condicionales = ["cod_licencia" => $licenciasArr];
    $bd = obtenerConexionIonSmart();
    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

function expirarLicencias($licencias) {
    if (!(is_array($licencias) && !empty($licencias)))
        return false;

    $licenciasArr = [];
    foreach ($licencias as $lic)
        $licenciasArr[] = $lic->cod_licencia;

    $nombre_tabla = "{$_SESSION["IONSMART_DATABASE"]}.licencias";
    $datos_tabla = [
        "estado" => ESTADOS_LICENCIA["ESTADO_LICENCIA_EXPIRADA"]
    ];
    $datos_condicionales = ["cod_licencia" => $licenciasArr];
    $bd = obtenerConexionIonSmart();
    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

function activarLicencias($licencias) {
    if (!(is_array($licencias) && !empty($licencias)))
        return false;

    $licenciasArr = [];
    foreach ($licencias as $lic)
        $licenciasArr[] = $lic->cod_licencia;

    $nombre_tabla = "{$_SESSION["IONSMART_DATABASE"]}.licencias";
    $datos_tabla = [
        "estado" => ESTADOS_LICENCIA["ESTADO_LICENCIA_ENUSO"]
    ];
    $datos_condicionales = ["cod_licencia" => $licenciasArr];

    $bd = obtenerConexionIonSmart();
    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

