<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

function obtenerReconocimientosPersonas(
    $refTrackingId = null,
    $fecha_ini = null,
    $fecha_fin = null,
    $hora_ini = null,
    $hora_fin = null,
    $cod_dispositivo = null,
    $genero = null,
    $edad = null,
    $ropa_superior = null,
    $ropa_inferior = null,
    $asistido = null,
    $cara_tapada = null,
    $telefono = null,
    $gafas = null,
    $tatuado = null,
    $carga_bolsa = null,
    $fumando = null,
    $marcado = null,
    $limit = 200,
) {
    $values = [];
    $where = "WHERE 1 ";
    if ($refTrackingId) {
        $where .= "AND pr.refTrackingId = :refTrackingId ";
        $values[":refTrackingId"] = $refTrackingId;
    }

    if ($fecha_ini && $fecha_fin) {
        $where .= "AND DATE(pr.fecha_hora) BETWEEN :fecha_ini AND :fecha_fin ";
        $values[":fecha_ini"] = $fecha_ini;
        $values[":fecha_fin"] = $fecha_fin;
    } else if ($fecha_ini && !$fecha_fin) {
        $where .= "AND TIME(pr.fecha_hora) >= :fecha_ini ";
        $values[":fecha_ini"] = $fecha_ini;
    } else if (!$fecha_ini && $fecha_fin) {
        $where .= "AND DATE(pr.fecha_hora) <= :fecha_fin ";
        $values[":fecha_fin"] = $fecha_fin;
    }

    if ($hora_ini && $hora_fin) {
        $where .= "AND TIME(pr.fecha_hora) BETWEEN :hora_ini AND :hora_fin ";
        $values[":hora_ini"] = $hora_ini;
        $values[":hora_fin"] = $hora_fin;
    } else if ($hora_ini && !$hora_fin) {
        $where .= "AND TIME(pr.fecha_hora) >= :hora_ini ";
        $values[":hora_ini"] = $hora_ini;
    } else if (!$hora_ini && $hora_fin) {
        $where .= "AND TIME(pr.fecha_hora) <= :hora_fin ";
        $values[":hora_fin"] = $hora_fin;
    }

    if ($cod_dispositivo) {
        $where .= "AND d.cod_dispositivo = :cod_dispositivo ";
        $values[":cod_dispositivo"] = $cod_dispositivo;
    }

    if ($genero) {
        if (is_array($genero)) {
            $placeholders = [];
            foreach ($genero as $index => $gen) {
                $ph = ":genero_" . $index;
                $placeholders[] = $ph;
                $values[$ph] = $gen;
            }

            $where .= "AND pr.genero IN (" . implode(", ", $placeholders) . ") ";
        } else {
            $where .= "AND pr.genero = :genero ";
            $values[":genero"] = $genero;
        }
    }

    if ($asistido !== null) {
        $where .= "AND pr.asistido = :asistido ";
        $values[":asistido"] = $asistido ? 1 : 0;
    }

    if ($cara_tapada !== null) {
        $where .= "AND pr.cara_tapada = :cara_tapada ";
        $values[":cara_tapada"] = $cara_tapada ? 1 : 0;
    }

    if ($ropa_superior) {
        if (is_array($ropa_superior)) {
            $placeholders = [];
            $where .= "AND (";
            foreach ($ropa_superior as $index => $item) {
                $ph = ":ropa_superior_" . $index;

                $where .= "pr.ropa_superior LIKE {$ph} OR ";
                $values[$ph] = "%$item%";
            }
            $where = rtrim($where, " OR ") . ") ";
        } else {
            $where .= "AND pr.ropa_superior LIKE :ropa_superior ";
            $values[":ropa_superior"] = "%$ropa_superior%";
        }
    }

    if ($ropa_inferior) {
        if (is_array($ropa_inferior)) {
            $placeholders = [];
            $where .= "AND (";
            foreach ($ropa_inferior as $index => $item) {
                $ph = ":ropa_inferior_" . $index;

                $where .= "pr.ropa_inferior LIKE {$ph} OR ";
                $values[$ph] = "%$item%";
            }
            $where = rtrim($where, " OR ") . ") ";
        } else {
            $where .= "AND pr.ropa_inferior LIKE :ropa_inferior ";
            $values[":ropa_inferior"] = "%$ropa_inferior%";
        }
    }

    if ($telefono !== null) {
        $where .= "AND pr.telefono = :telefono ";
        $values[":telefono"] = $telefono ? 1 : 0;
    }

    if ($gafas !== null) {
        $where .= "AND pr.gafas = :gafas ";
        $values[":gafas"] = $gafas ? 1 : 0;
    }

    if ($edad != null) {
        if (is_array($edad)) {
            $placeholders = [];
            foreach ($edad as $index => $item) {
                $ph = ":edad_" . $index;
                $placeholders[] = $ph;
                $values[$ph] = $item;
            }

            $where .= "AND pr.edad IN (" . implode(", ", $placeholders) . ") ";
        } else {
            $where .= "AND pr.edad = :edad ";
            $values[":edad"] = $edad;
        }
    }

    if ($tatuado !== null) {
        $where .= "AND pr.tatuado = :tatuado ";
        $values[":tatuado"] = $tatuado ? 1 : 0;
    }

    if ($carga_bolsa !== null) {
        $where .= "AND pr.carga_bolsa = :carga_bolsa ";
        $values[":carga_bolsa"] = $carga_bolsa ? 1 : 0;
    }

    if ($fumando !== null) {
        $where .= "AND pr.fumando = :fumando ";
        $values[":fumando"] = $fumando ? 1 : 0;
    }
    if ($marcado) {
        $where .= "AND prm.refTrackingId IS NOT NULL ";
    }

    $sql = sprintf(
        "SELECT
            pr.genero, pr.asistido, pr.cara_tapada, pr.ropa_superior, pr.ropa_inferior,
            pr.telefono, pr.gafas, pr.edad, pr.tatuado, pr.carga_bolsa, pr.fumando,
            pr.instanceId, pr.refTrackingId, pr.fecha_hora, 
            IFNULL(pr.foto_blur, pr.foto) as foto,
            d.cod_dispositivo, d.nom_dispositivo, d.deviceId, 'mobility' AS modulo,
            CASE WHEN prm.refTrackingId IS NULL 
                THEN false
                ELSE true 
            END as marcado
        FROM {{.CORE}}.persona_reconocimiento pr
        LEFT JOIN {{.CORE}}.analysis_cloud_instancias aci ON pr.instanceId = aci.instanceId
        LEFT JOIN {{.CORE}}.dispositivos d ON aci.cod_dispositivo = d.cod_dispositivo
        LEFT JOIN {{.CORE}}.persona_reconocimiento_mark prm ON pr.refTrackingId = prm.refTrackingId AND prm.cod_usuario = :usuario_mark
        %s
        ORDER BY pr.fecha_hora DESC LIMIT :limit;",
        $where,
    );
    $values[":usuario_mark"] = $_SESSION["cod_usuario_token"] ?? "";
    $values[":limit"] = (int)$limit;

    try {
        $bd = obtenerConexion();

        $rows = ejecutarConsultaSQL($bd, $sql, $values, true);
        $mapped = array_map(function ($row) {
            $row->asistido = $row->asistido == 1 ? true : false;
            $row->cara_tapada = $row->cara_tapada == 1 ? true : false;
            $row->telefono = $row->telefono == 1 ? true : false;
            $row->gafas = $row->gafas == 1 ? true : false;
            $row->tatuado = $row->tatuado == 1 ? true : false;
            $row->carga_bolsa = $row->carga_bolsa == 1 ? true : false;
            $row->fumando = $row->fumando == 1 ? true : false;
            $row->gafas = $row->gafas == 1 ? true : false;
            $row->marcado = $row->marcado == 1 ? true : false;
            $row->ropa_inferior = explode(";", $row->ropa_inferior ?? "");
            $row->ropa_superior = explode(";", $row->ropa_superior ?? "");
            return $row;
        }, $rows);
        return $mapped;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerFotoOriginal($refTrackingId = null)
{
    $values = [];
    if (!$refTrackingId) {
        return false;
    }

    $where = "WHERE pr.refTrackingId = :refTrackingId ";
    $values[":refTrackingId"] = $refTrackingId;

    $sql = sprintf("SELECT
		pr.refTrackingId, pr.foto
	FROM {{.CORE}}.persona_reconocimiento pr
    %s;", $where);

    try {
        $bd = obtenerConexion();

        $rows = ejecutarConsultaSQL($bd, $sql, $values, true);
        if (count($rows) > 0) $rows = $rows[0];
        return $rows;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerReconocimientosPersonasCount()
{
    $sql = "SELECT COUNT(*) AS total FROM {{.CORE}}.persona_reconocimiento pr ";
    try {
        $bd = obtenerConexion();
        $res = ejecutarConsultaSQL($bd, $sql, [], true);
        return $res[0]->total ?? 0;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerReconocimientosPersonasGroup(
    $fecha_ini = null,
    $fecha_fin = null,
    $hora_ini = null,
    $hora_fin = null,
    $cod_dispositivo = null,
    $genero = null,
    $edad = null,
    $ropa_superior = null,
    $ropa_inferior = null,
    $asistido = null,
    $cara_tapada = null,
    $telefono = null,
    $gafas = null,
    $tatuado = null,
    $carga_bolsa = null,
    $fumando = null,
    $group = null,
) {
    $bd = obtenerConexion();
    $seleccion = "";
    $agrupacion = "";
    $values = [];

    if (!empty($group)) {
        $campos = [];
        foreach ($group as $campo => $valor) {
            ${$campo} = $valor;
            $campos[] = match (strtolower($valor)) {
                "fecha" => [
                    "DATE(pr.fecha_hora) as fecha", // Seleccion
                    "fecha", // Agrupacion
                ],
                "hora" => [
                    "hour(TIME(pr.fecha_hora)) as hora",
                    "hora",
                ],
                "cod_dispositivo", "dispositivo" => [
                    "d.cod_dispositivo, d.nom_dispositivo, d.coordenadas",
                    "d.cod_dispositivo",
                ],
                "genero" => ["pr.genero", "pr.genero"],
                "fumando" => ["pr.fumando", "pr.fumando"],
                "tatuado" => ["pr.tatuado", "pr.tatuado"],
                "telefono" => ["pr.telefono", "pr.telefono"],
                "cara_tapada" => ["pr.cara_tapada", "pr.cara_tapada"],
                "asistido" => ["pr.asistido", "pr.asistido"],
                "carga_bolsa" => ["pr.carga_bolsa", "pr.carga_bolsa"],
                "gafas" => ["pr.gafas", "pr.gafas"],
                "edad" => ["pr.edad", "pr.edad"],
                default => [],
            };
        }

        if (!empty($campos)) {
            foreach ($campos as $c) {
                if (empty($c)) {
                    continue;
                }

                if ($agrupacion == "") {
                    $agrupacion = "GROUP BY ";
                }

                $seleccion .= "{$c[0]}, ";
                $agrupacion .= "{$c[1]}, ";
            }

            $agrupacion = rtrim($agrupacion, ", ");
            $seleccion = rtrim($seleccion, ', ');
            $order = rtrim($order, ", ");
        }
    }

    $values = [];
    $where = "WHERE 1 ";

    if ($fecha_ini && $fecha_fin) {
        $where .= "AND DATE(pr.fecha_hora) BETWEEN :fecha_ini AND :fecha_fin ";
        $values[":fecha_ini"] = $fecha_ini;
        $values[":fecha_fin"] = $fecha_fin;
    } else if ($fecha_ini && !$fecha_fin) {
        $where .= "AND TIME(pr.fecha_hora) >= :fecha_ini ";
        $values[":fecha_ini"] = $fecha_ini;
    } else if (!$fecha_ini && $fecha_fin) {
        $where .= "AND DATE(pr.fecha_hora) <= :fecha_fin ";
        $values[":fecha_fin"] = $fecha_fin;
    }

    if ($hora_ini && $hora_fin) {
        $where .= "AND TIME(pr.fecha_hora) BETWEEN :hora_ini AND :hora_fin ";
        $values[":hora_ini"] = $hora_ini;
        $values[":hora_fin"] = $hora_fin;
    } else if ($hora_ini && !$hora_fin) {
        $where .= "AND TIME(pr.fecha_hora) >= :hora_ini ";
        $values[":hora_ini"] = $hora_ini;
    } else if (!$hora_ini && $hora_fin) {
        $where .= "AND TIME(pr.fecha_hora) <= :hora_fin ";
        $values[":hora_fin"] = $hora_fin;
    }

    if ($cod_dispositivo) {
        $where .= "AND d.cod_dispositivo = :cod_dispositivo ";
        $values[":cod_dispositivo"] = $cod_dispositivo;
    }

    if ($genero) {
        if (is_array($genero)) {
            $placeholders = [];
            foreach ($genero as $index => $gen) {
                $ph = ":genero_" . $index;
                $placeholders[] = $ph;
                $values[$ph] = $gen;
            }

            $where .= "AND pr.genero IN (" . implode(", ", $placeholders) . ") ";
        } else {
            $where .= "AND pr.genero = :genero ";
            $values[":genero"] = $genero;
        }
    }

    if ($asistido !== null) {
        $where .= "AND pr.asistido = :asistido ";
        $values[":asistido"] = $asistido ? 1 : 0;
    }

    if ($cara_tapada !== null) {
        $where .= "AND pr.cara_tapada = :cara_tapada ";
        $values[":cara_tapada"] = $cara_tapada ? 1 : 0;
    }

    if ($ropa_superior) {
        if (is_array($ropa_superior)) {
            $placeholders = [];
            $where .= "AND (";
            foreach ($ropa_superior as $index => $item) {
                $ph = ":ropa_superior_" . $index;

                $where .= "pr.ropa_superior LIKE {$ph} OR ";
                $values[$ph] = "%$item%";
            }
            $where = rtrim($where, " OR ") . ") ";
        } else {
            $where .= "AND pr.ropa_superior LIKE :ropa_superior ";
            $values[":ropa_superior"] = "%$ropa_superior%";
        }
    }

    if ($ropa_inferior) {
        if (is_array($ropa_inferior)) {
            $placeholders = [];
            $where .= "AND (";
            foreach ($ropa_inferior as $index => $item) {
                $ph = ":ropa_inferior_" . $index;

                $where .= "pr.ropa_inferior LIKE {$ph} OR ";
                $values[$ph] = "%$item%";
            }
            $where = rtrim($where, " OR ") . ") ";
        } else {
            $where .= "AND pr.ropa_inferior LIKE :ropa_inferior ";
            $values[":ropa_inferior"] = "%$ropa_inferior%";
        }
    }

    if ($telefono !== null) {
        $where .= "AND pr.telefono = :telefono ";
        $values[":telefono"] = $telefono ? 1 : 0;
    }

    if ($gafas !== null) {
        $where .= "AND pr.gafas = :gafas ";
        $values[":gafas"] = $gafas ? 1 : 0;
    }

    if ($edad != null) {
        if (is_array($edad)) {
            $placeholders = [];
            foreach ($edad as $index => $item) {
                $ph = ":edad_" . $index;
                $placeholders[] = $ph;
                $values[$ph] = $item;
            }

            $where .= "AND pr.edad IN (" . implode(", ", $placeholders) . ") ";
        } else {
            $where .= "AND pr.edad = :edad ";
            $values[":edad"] = $edad;
        }
    }

    if ($tatuado !== null) {
        $where .= "AND pr.tatuado = :tatuado ";
        $values[":tatuado"] = $tatuado ? 1 : 0;
    }

    if ($carga_bolsa !== null) {
        $where .= "AND pr.carga_bolsa = :carga_bolsa ";
        $values[":carga_bolsa"] = $carga_bolsa ? 1 : 0;
    }

    if ($fumando !== null) {
        $where .= "AND pr.fumando = :fumando ";
        $values[":fumando"] = $fumando ? 1 : 0;
    }


    $sql =
        "SELECT
            {$seleccion}, COUNT(*) AS total
        FROM {{.CORE}}.persona_reconocimiento pr
        LEFT JOIN {{.CORE}}.analysis_cloud_instancias aci ON pr.instanceId = aci.instanceId
        LEFT JOIN {{.CORE}}.dispositivos d ON aci.cod_dispositivo = d.cod_dispositivo
        {$where}
        {$agrupacion}
        ORDER BY pr.fecha_hora ASC ";

    try {
        $bd = obtenerConexion();

        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function modificarReconocimientosPersonas(
    $refTrackingId,
    $foto = null
) {
    if (!$refTrackingId || !$foto) return false;
    $bd = obtenerConexion();

    $nombre_tabla = "{{.CORE}}.persona_reconocimiento";
    $datos = [
        "foto" => $foto,
    ];
    $datos_condicionales = [
        "refTrackingId" => $refTrackingId,
    ];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos, $datos_condicionales);
}

function existeReconocimientoPersona($refTrackingId)
{
    $rows = obtenerReconocimientosPersonas(refTrackingId: $refTrackingId);
    if (isset($rows["error"])) {
        return false;
    }

    return count($rows) >= 1;
}

function obtenerReconocimientoPersonaMarcado($refTrackingId, $cod_usuario)
{
    $bd = obtenerConexion();
    $values = [];
    $where = "WHERE 1 ";

    if ($refTrackingId != null) {
        $where .= "AND prm.refTrackingId = ? ";
        $values[] = $refTrackingId;
    }

    if ($cod_usuario != null) {
        $where .= "AND prm.cod_usuario = ? ";
        $values[] = $cod_usuario;
    }

    $sql = sprintf(
        "SELECT * 
        FROM {{.CORE}}.persona_reconocimiento_mark prm 
        %s",
        $where,
    );

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function marcarReconocimientoPersona($refTrackingId, $cod_usuario)
{
    if (!($refTrackingId && $cod_usuario)) {
        return [
            "message" => "Error al marcar reconocimiento: Parámetros inválidos",
            "error" => true,
        ];
    }

    if (!existeReconocimientoPersona($refTrackingId)) {
        return [
            "message" => "Error al marcar reconocimiento: No existe",
            "error" => true,
        ];
    }

    $recon = obtenerReconocimientoPersonaMarcado($refTrackingId, $cod_usuario);
    if (isset($recon["error"])) {
        return $recon;
    }

    $nombre_tabla = "{{.CORE}}.persona_reconocimiento_mark";
    $bd = obtenerConexion();

    if (count($recon) >= 1) { // Está marcado, lo desmarcamos
        $recon = $recon[0];
        $datos_condicionales = [
            "cod_mark" => $recon->cod_mark,
        ];

        return [
            "action" => "unmark",
            "success" => eliminarDatosTabla(
                $bd,
                __FUNCTION__,
                $nombre_tabla,
                $datos_condicionales,
            ),
        ];
    } else { // Lo marcamos, porque no existe
        $datos_tabla = [
            "refTrackingId" => $refTrackingId,
            "cod_usuario" => $cod_usuario,
        ];

        return [
            "action" => "mark",
            "success" => insertarDatosTabla(
                $bd,
                __FUNCTION__,
                $nombre_tabla,
                $datos_tabla
            ),
        ];
    }
}
