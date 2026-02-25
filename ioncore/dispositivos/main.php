<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/cloud_nx/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/fabricantes/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/licencias/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/mainNx.php";

function insertarDispositivos(
    $nom_dispositivo = null,
    $direccion = null,
    $coordenadas = null,
    $cod_provincia = null,
    $cod_poblacion = null,
    $cp = null,
    $serial_number = null,
    $cod_modelo = null,
    $cod_nodo = null,
    $puerta_enlace = null,
    $servidor_dhcp = null,
    $mascara_red = null,
    $protocolo_ip = null,
    $ip_dispositivo = null,
    $direccion_mac = null,
    $deveui = null,
    $appeui = null,
    $appkey = null,
    $joineui = null,
    $username = null,
    $password = null,
    $modulos = null,
    $cod_cloud = null,
    $deviceId = null,
    $streamUrl = null
) {
    $modulosInsertados = [];

    if (isset($password)) {
        $hashedPassword = hash("sha256", $password);
    }

    $nombre_tabla = "{{.CORE}}.dispositivos";
    $datos_tabla = [
        "cp" => $cp,
        "nom_dispositivo" => $nom_dispositivo,
        "direccion" => $direccion,
        "coordenadas" => $coordenadas,
        "cod_provincia" => $cod_provincia,
        "cod_poblacion" => $cod_poblacion,
        "serial_number" => $serial_number,
        "cod_modelo" => $cod_modelo,
        "cod_nodo" => $cod_nodo,
        "puerta_enlace" => $puerta_enlace,
        "servidor_dhcp" => $servidor_dhcp,
        "mascara_red" => $mascara_red,
        "protocolo_ip" => $protocolo_ip,
        "ip_dispositivo" => $ip_dispositivo,
        "direccion_mac" => $direccion_mac,
        "deveui" => $deveui,
        "appeui" => $appeui,
        "appkey" => $appkey,
        "joineui" => $joineui,
        "username" => $username,
        "password" => $hashedPassword ?? null,
        "cod_cloud" => $cod_cloud,
        "streamUrl" => $streamUrl,
        "deviceId" => $deviceId
    ];
    $bd = obtenerConexion();
    $cod_dispositivo = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, true);
    $insert = $cod_dispositivo !== false && !isset($cod_dispositivo["error"]);

    $areas_city = null;
    $creacion_evento = null;

    if ($modulos != null && $insert) {
        $modulosInsertados = addModulosDispositivo($modulos, $cod_dispositivo);

        if (
            !empty($modulosInsertados["modulosCorrectos"]) &&
            $cod_cloud != null
        ) {
            $creacion_evento = crearEventoAnalyticDispositivoNx($cod_dispositivo);
        }

        $include = include_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/areas/main.php";
        if (
            $include &&
            function_exists("comprobarAreasDispositivos") &&
            in_array("mobility", $modulosInsertados["modulosCorrectos"])
        ) {
            $areas_city = comprobarAreasDispositivos($cod_dispositivo);
        }
    }

    return [
        "insert" => $insert,
        "cod_dispositivo" => $cod_dispositivo,
        "modulos" => $modulosInsertados,
        "areas_city" => $areas_city,
        "creacion_evento" => $creacion_evento["saveEventRule"]["success"] ?? null,
    ];
}

function modificarDispositivos(
    $cod_dispositivo = null,
    $nom_dispositivo = null,
    $direccion = null,
    $cp = null,
    $coordenadas = null,
    $cod_provincia = null,
    $cod_poblacion = null,
    $serial_number = null,
    $cod_modelo = null,
    $cod_nodo = null,
    $puerta_enlace = null,
    $servidor_dhcp = null,
    $mascara_red = null,
    $protocolo_ip = null,
    $ip_dispositivo = null,
    $direccion_mac = null,
    $deveui = null,
    $appeui = null,
    $appkey = null,
    $joineui = null,
    $username = null,
    $password = null,
    $modulos = null,
    $deviceId = null,
    $cod_cloud = null,
    $streamUrl = null,
    $id_regla_evento = null,
) {
    $nombre_tabla = "{{.CORE}}.dispositivos";
    $campos = [
        "nom_dispositivo" => $nom_dispositivo,
        "cod_modelo" => $cod_modelo,
        "ip_dispositivo" => $ip_dispositivo,
        "direccion" => $direccion,
        "coordenadas" => $coordenadas,
        "cod_provincia" => $cod_provincia,
        "cod_poblacion" => $cod_poblacion,
        "servidor_dhcp" => $servidor_dhcp,
        "direccion_mac" => $direccion_mac,
        "puerta_enlace" => $puerta_enlace,
        "mascara_red" => $mascara_red,
        "protocolo_ip" => $protocolo_ip,
        "serial_number" => $serial_number,
        "cod_nodo" => $cod_nodo,
        "cp" => $cp,
        "deveui" => $deveui,
        "appeui" => $appeui,
        "appkey" => $appkey,
        "joineui" => $joineui,
        "username" => $username,
        "password" => $password,
        "deviceId" => $deviceId,
        "cod_cloud" => $cod_cloud,
        "streamUrl" => $streamUrl,
        "id_regla_evento" => $id_regla_evento,
    ];
    $campos_condicionales = [
        "cod_dispositivo" => $cod_dispositivo,
    ];

    $modificarModulos = false;
    if ($modulos != null && $cod_dispositivo != null) {
        $modificarModulos = modificarModulosDispositivo($modulos, $cod_dispositivo);
        cambiarEstadoLicenciasServidor($_ENV["ION_SERVER"]);
    }

    try {
        $bd = obtenerConexion();
        $update = modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos, $campos_condicionales);
        if ($update == false) {
            return $modificarModulos;
        }

        if ($modificarModulos != false || $coordenadas != null) {
            $include = include_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/areas/main.php";
            if (
                $include &&
                function_exists("comprobarAreasDispositivos") &&
                in_array("mobility", $modificarModulos["modulosCorrectos"])
            ) {
                comprobarAreasDispositivos($cod_dispositivo);
            }
        }

        return $update;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "update", $e, true);
    }
}


function obtenerDispositivos(
    $cod_dispositivo = null,
    $nom_dispositivo = null,
    $direccion = null,
    $cp = null,
    $coordenadas = null,
    $cod_provincia = null,
    $cod_poblacion = null,
    $serial_number = null,
    $cod_modelo = null,
    $cod_fabricante = null,
    $cod_categoria = null,
    $cod_nodo = null,
    $puerta_enlace = null,
    $servidor_dhcp = null,
    $mascara_red = null,
    $protocolo_ip = null,
    $ip_dispositivo = null,
    $direccion_mac = null,
    $nombre_modelo = null,
    $nombre_fabricante = null,
    $nombre_categoria = null,
    $deveui = null,
    $appeui = null,
    $appkey = null,
    $username = null,
    $password = null,
    $modulosFiltro = null,
    $deviceId = null,
    $nom_dispositivo_exacto = null,
    $cod_sector = null,
    $cod_cloud = null,
    $comprobarRadar = true,
    $comprobarCanalActivo = false
) {
    $bd = obtenerConexion();
    $values = [];

    $comprobacion_radar = "";
    $comprobacion_radar_join = "";
    $comprobacion_canal = "";
    if ($comprobarRadar === true) {
        $comprobacion_radar = ", IFNULL(vr.total, 0) > 0 as tiene_radar ";
        $comprobacion_radar_join =
            "LEFT JOIN (
                SELECT COUNT(vr2.cod_reconoc) as total, vr2.cod_dispositivo
                FROM {{.CORE}}.vehiculos_reconocidos vr2
                WHERE vr2.velocidad_vehiculo > 0
                GROUP BY vr2.cod_dispositivo
            ) vr ON vr.cod_dispositivo = d.cod_dispositivo";
    }

    if ($comprobarCanalActivo !== false) {
        $comprobacion_canal = "AND dm.estado_canal != '" . ESTADOS_CANALES["ESTADO_CADUCADO"] . "' ";
    }

    $sql = "SELECT 
        d.cod_dispositivo, d.deviceId, d.nom_dispositivo, d.direccion, d.cp, d.coordenadas, 
        d.cod_provincia, d.cod_poblacion, d.serial_number, d.cod_nodo, d.puerta_enlace, 
        d.servidor_dhcp, d.mascara_red, d.protocolo_ip, d.ip_dispositivo, d.direccion_mac, 
        d.deveui, d.appeui, d.appkey, d.joineui, d.username, '*****' as password, cl.systemId, cl.cod_cloud,
        cl.nombre as nombre_cloud, f.nombre_fabricante, m.nombre_modelo, c.nombre_categoria, f.cod_fabricante,
        m.cod_modelo, c.cod_categoria $comprobacion_radar
	FROM {{.CORE}}.dispositivos d
    LEFT JOIN {{.CORE}}.cloud_nx cl ON d.cod_cloud = cl.cod_cloud
    LEFT JOIN {{.CORE}}.fabricantes_modelo m ON d.cod_modelo = m.cod_modelo
	LEFT JOIN {{.CORE}}.fabricantes f ON m.cod_fabricante = f.cod_fabricante
	LEFT JOIN {{.CORE}}.fabricantes_categoria c ON m.cod_categoria = c.cod_categoria
	LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON dm.cod_dispositivo = d.cod_dispositivo $comprobacion_canal
	LEFT JOIN {{.CORE}}.modulos ON modulos.cod_modulo = dm.cod_modulo
	LEFT JOIN {{.CORE}}.sectores_verticales sv ON sv.cod_sector = modulos.cod_sector
    $comprobacion_radar_join
	WHERE 1 ";

    if ($cod_dispositivo != null) {
        if (is_array($cod_dispositivo) && !empty($cod_dispositivo)) {
            $sql .= "AND d.cod_dispositivo IN (";
            for ($i = 0; $i < count($cod_dispositivo); $i++) {
                $disp = $cod_dispositivo[$i];

                if ($disp != null && $disp != "") {
                    $sql .= "?, ";
                    $values[] = $disp;
                }
            }

            $sql = rtrim($sql, ", ");
            $sql .= ")";
        } else {
            $sql .= "AND d.cod_dispositivo = ? ";
            $values[] = $cod_dispositivo;
        }
    }

    if ($nom_dispositivo != null) {
        $sql .= "AND (
            d.nom_dispositivo LIKE ? 
            OR d.deviceId LIKE ?
            OR d.direccion_mac LIKE ?
        ) ";
        $values[] = "%$nom_dispositivo%";
        $values[] = "%$nom_dispositivo%";
        $values[] = "%$nom_dispositivo%";
    }

    if ($nom_dispositivo_exacto != null) {
        $sql .= "AND d.nom_dispositivo = ? ";
        $values[] = $nom_dispositivo_exacto;
    }

    if ($direccion != null) {
        $sql .= "AND d.direccion LIKE ? ";
        $values[] = "%$direccion%";
    }

    if ($cp != null) {
        $sql .= "AND d.cp = ? ";
        $values[] = $cp;
    }

    if ($coordenadas != null) {
        $sql .= "AND d.coordenadas = ? ";
        $values[] = $coordenadas;
    }

    if ($cod_provincia != null) {
        $sql .= "AND d.cod_provincia = ? ";
        $values[] = $cod_provincia;
    }

    if ($cod_poblacion != null) {
        $sql .= "AND d.cod_poblacion = ? ";
        $values[] = $cod_poblacion;
    }

    if ($serial_number != null) {
        $sql .= "AND d.serial_number = ? ";
        $values[] = $serial_number;
    }

    if ($cod_modelo != null) {
        $sql .= "AND d.cod_modelo = ? ";
        $values[] = $cod_modelo;
    }

    if ($cod_fabricante != null) {
        $sql .= "AND m.cod_fabricante = ? ";
        $values[] = $cod_fabricante;
    }

    if ($cod_categoria != null) {
        if (is_array($cod_categoria) && !empty($cod_categoria)) {
            $sql .= "AND m.cod_categoria IN (";
            for ($i = 0; $i < count($cod_categoria); $i++) {
                $cat = $cod_categoria[$i];

                if ($cat != null && $cat != "") {
                    $sql .= "?, ";
                    $values[] = $cat;
                }
            }

            $sql = rtrim($sql, ", ");
            $sql .= ")";
        } else {
            $sql .= "AND m.cod_categoria = ? ";
            $values[] = $cod_categoria;
        }
    }

    if ($nombre_fabricante != null) {
        $sql .= "AND f.nombre_fabricante LIKE ? ";
        $values[] = "%$nombre_fabricante%";
    }

    if ($nombre_modelo != null) {
        $sql .= "AND m.nombre_modelo LIKE ? ";
        $values[] = "%$nombre_modelo%";
    }

    if ($nombre_categoria != null) {
        $sql .= "AND c.nombre_categoria LIKE ? ";
        $values[] = "%$nombre_categoria%";
    }

    if ($cod_nodo != null) {
        $sql .= "AND d.cod_nodo = ? ";
        $values[] = $cod_nodo;
    }

    if ($puerta_enlace != null) {
        $sql .= "AND d.puerta_enlace = ? ";
        $values[] = $puerta_enlace;
    }

    if ($servidor_dhcp != null) {
        $sql .= "AND d.servidor_dhcp = ? ";
        $values[] = $servidor_dhcp;
    }

    if ($mascara_red != null) {
        $sql .= "AND d.mascara_red = ? ";
        $values[] = $mascara_red;
    }

    if ($protocolo_ip != null) {
        $sql .= "AND d.protocolo_ip = ? ";
        $values[] = $protocolo_ip;
    }

    if ($ip_dispositivo != null) {
        $sql .= "AND d.ip_dispositivo = ? ";
        $values[] = $ip_dispositivo;
    }

    if ($direccion_mac != null) {
        $sql .= "AND d.direccion_mac = ? ";
        $values[] = $direccion_mac;
    }

    if ($deveui != null) {
        $sql .= "AND d.deveui = ? ";
        $values[] = $deveui;
    }

    if ($appeui != null) {
        $sql .= "AND d.appeui = ? ";
        $values[] = $appeui;
    }

    if ($appkey != null) {
        $sql .= "AND d.appkey = ? ";
        $values[] = $appkey;
    }

    if ($username != null) {
        $sql .= "AND d.username = ? ";
        $values[] = $username;
    }

    if ($password != null) {
        $sql .= "AND d.password = ? ";
        $values[] = $password;
    }

    if ($deviceId != null) {
        $sql .= "AND d.deviceId LIKE ? ";
        $values[] = "%$deviceId%";
    }

    if ($cod_sector != null) {
        $sql .= "AND sv.cod_sector = ? ";
        $values[] = $cod_sector;
    }

    if ($cod_cloud != null) {
        $sql .= "AND d.cod_cloud = ? ";
        $values[] = $cod_cloud;
    }

    if ($modulosFiltro != null) {
        if (is_array($modulosFiltro) && !empty($modulosFiltro)) {
            $sql .= "AND dm.cod_modulo IN (";
            foreach ($modulosFiltro as $mod) {
                $sql .= "?, ";
                $values[] = $mod;
            }
            $sql = rtrim($sql, ", ") . ") ";
        } else if (is_string($modulosFiltro) or is_int($modulosFiltro)) {
            $sql .= "AND dm.cod_modulo = ? ";
            $values[] = $modulosFiltro;
        }
    }

    $sql .= " GROUP BY d.cod_dispositivo ORDER BY d.cod_dispositivo ASC; ";
    try {
        $bd = obtenerConexion();
        $dispositivos = ejecutarConsultaSQL($bd, $sql, $values, true);

        if (!empty($dispositivos) && !isset($dispositivos["error"])) {
            $modulos = obtenerModulosDispositivosParam(comprobarCanalActivo: $comprobarCanalActivo);
            foreach ($dispositivos as $disp) {
                $disp->modulos = [];

                if (!empty($modulos) && !isset($modulos["error"])) {
                    for ($i = 0; $i < count($modulos); $i++) {
                        $mod = $modulos[$i];

                        if (
                            $disp->cod_dispositivo == $mod->cod_dispositivo
                        )
                            $disp->modulos[] = [
                                "cod_modulo" => $mod->cod_modulo,
                                "abreviacion" => $mod->abreviacion,
                                "nombre_modulo" => $mod->nombre_modulo,
                                "cod_sector" => $mod->cod_sector,
                                "nombre_sector" => $mod->nombre_sector,
                                "estado_canal" => $mod->estado_canal,
                                "fecha_fin_prorroga" => $mod->fecha_fin_prorroga
                            ];
                    }
                }
            }
        }

        return $dispositivos;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerCamaras(
    $cod_camara = null,
    $nombre = null,
    $modulos = null,
    $comprobarCanalActivo = true,
) {
    $disp = obtenerDispositivos(
        cod_dispositivo: $cod_camara,
        nom_dispositivo: $nombre,
        modulosFiltro: $modulos,
        cod_categoria: CATEGORIAS_DISPOSITIVOS["CAMARA"],
        comprobarCanalActivo: $comprobarCanalActivo,
    );

    if (!(!empty($disp) && !isset($disp["error"]))) {
        return $disp;
    }

    return array_map(
        array: $disp,
        callback: function ($dispositivo) {
            $d = new stdClass;
            $d->cod_dispositivo = $dispositivo->cod_dispositivo;
            $d->nom_dispositivo = $dispositivo->nom_dispositivo;
            $d->deviceId = $dispositivo->deviceId;
            $d->modulos = $dispositivo->modulos;
            return $d;
        },
    );
}

function obtenerMonitores(
    $cod_monitor = null,
    $nombre = null,
    $modulos = null,
    $comprobarCanalActivo = true,
) {
    $disp = obtenerDispositivos(
        cod_dispositivo: $cod_monitor,
        nom_dispositivo: $nombre,
        modulosFiltro: $modulos,
        cod_categoria: CATEGORIAS_DISPOSITIVOS["MONITOR"],
        comprobarCanalActivo: $comprobarCanalActivo,
    );

    if (!(!empty($disp) && !isset($disp["error"]))) {
        return $disp;
    }

    return array_map(
        array: $disp,
        callback: function ($dispositivo) {
            $d = new stdClass;
            $d->cod_dispositivo = $dispositivo->cod_dispositivo;
            $d->nom_dispositivo = $dispositivo->nom_dispositivo;
            $d->deviceId = $dispositivo->deviceId;
            $d->modulos = $dispositivo->modulos;
            return $d;
        },
    );
}

function obtenerMaquinas(
    $cod_maquina = null,
    $nombre = null,
    $modulos = null,
    $comprobarCanalActivo = true,
) {
    $disp = obtenerDispositivos(
        cod_dispositivo: $cod_maquina,
        nom_dispositivo: $nombre,
        modulosFiltro: $modulos,
        cod_categoria: CATEGORIAS_DISPOSITIVOS["MAQUINA"],
        comprobarCanalActivo: $comprobarCanalActivo,
    );
    if (!(!empty($disp) && !isset($disp["error"]))) {
        return $disp;
    }

    return array_map(
        array: $disp,
        callback: function ($dispositivo) {
            $d = new stdClass;
            $d->cod_dispositivo = $dispositivo->cod_dispositivo;
            $d->nom_dispositivo = $dispositivo->nom_dispositivo;
            $d->deviceId = $dispositivo->deviceId;
            $d->modulos = $dispositivo->modulos;
            return $d;
        },
    );
}

function obtenerSensores(
    $cod_sensor = null,
    $nombre = null,
    $cod_categoria = null,
    $modulos = null,
    $comprobarCanalActivo = true,
) {
    $disp = obtenerDispositivos(
        cod_dispositivo: $cod_sensor,
        nom_dispositivo: $nombre,
        modulosFiltro: $modulos,
        cod_categoria: $cod_categoria ?? [
            CATEGORIAS_DISPOSITIVOS["SENSOR_AMBIENTE"],
            CATEGORIAS_DISPOSITIVOS["SENSOR_ALMACENAJE"],
            CATEGORIAS_DISPOSITIVOS["SENSOR_ACCESO"],
        ],
        comprobarCanalActivo: $comprobarCanalActivo,
    );
    if (!(!empty($disp) && !isset($disp["error"]))) {
        return $disp;
    }

    return array_map(
        array: $disp,
        callback: function ($dispositivo) {
            $d = new stdClass;
            $d->cod_dispositivo = $dispositivo->cod_dispositivo;
            $d->nom_dispositivo = $dispositivo->nom_dispositivo;
            $d->EUI = $dispositivo->deveui;
            $d->modulos = $dispositivo->modulos;
            return $d;
        },
    );
}


function obtenerDispositivosDatosCloud(
    $cod_dispositivo = null,
    $deviceId = null,
    $cod_cloud = null,
    $sinComprobacion = false,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = "SELECT DISTINCT d.*, cl.systemId, cl.ip, cl.puerto, cl.user, cl.password, cl.nombre as nombre_cloud
	FROM {{.CORE}}.dispositivos d
	LEFT JOIN {{.CORE}}.cloud_nx cl ON d.cod_cloud = cl.cod_cloud
	LEFT JOIN {{.CORE}}.fabricantes_modelo m ON d.cod_modelo = m.cod_modelo
    LEFT JOIN {{.CORE}}.fabricantes f ON m.cod_fabricante = f.cod_fabricante
	LEFT JOIN {{.CORE}}.fabricantes_categoria c ON m.cod_categoria = c.cod_categoria
	LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON dm.cod_dispositivo = d.cod_dispositivo
    WHERE 1 ";
    if (!$sinComprobacion) {
        $sql .= "AND dm.estado_canal <> ? ";
        $values[] = ESTADOS_CANALES["ESTADO_CADUCADO"];
    }

    if ($cod_dispositivo != null) {
        if (is_array($cod_dispositivo) && !empty($cod_dispositivo)) {
            $sql .= "AND d.cod_dispositivo IN (";
            for ($i = 0; $i < count($cod_dispositivo); $i++) {
                $disp = $cod_dispositivo[$i];

                if ($disp != null && $disp != "") {
                    $sql .= "?, ";
                    $values[] = $disp;
                }
            }

            $sql = rtrim($sql, ", ");
            $sql .= ")";
        } else {
            $sql .= "AND d.cod_dispositivo = ? ";
            $values[] = $cod_dispositivo;
        }
    }

    if ($deviceId) {
        $sql .= "AND d.deviceId = ? ";
        $values[] = $deviceId;
    }

    if ($cod_cloud) {
        $sql .= "AND d.cod_cloud = ? ";
        $values[] = $cod_cloud;
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerModulosDispositivosParam(
    $cod_dispositivo = null,
    $comprobarCanalActivo = false,
    $cod_sector = null,
    $cod_modulo = null
) {
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT 
			dm.cod_dispositivo, dm.cod_modulo, m.nombre_modulo, 
            m.abreviacion, m.cod_sector, dm.estado_canal, dm.fecha_fin_prorroga,
            sv.nombre_sector
		FROM {{.CORE}}.dispositivos_modulos dm 
		LEFT JOIN {{.CORE}}.modulos m ON dm.cod_modulo = m.cod_modulo
		LEFT JOIN {{.CORE}}.sectores_verticales sv ON sv.cod_sector = m.cod_sector
		WHERE 1 ";

    if ($cod_dispositivo != null) {
        $sql .= "AND dm.cod_dispositivo = ? ";
        $values[] = "$cod_dispositivo";
    }

    if ($cod_sector != null) {
        $sql .= "AND m.cod_sector = ? ";
        $values[] = "$cod_sector";
    }

    if ($comprobarCanalActivo !== false) {
        $sql .= "AND dm.estado_canal != '" . ESTADOS_CANALES["ESTADO_CADUCADO"] . "' ";
    }

    if ($cod_modulo != null) {
        $sql .= "AND m.cod_modulo = ? ";
        $values[] = "$cod_modulo";
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function eliminarDispositivos(
    $cod_dispositivo,
) {
    if ($cod_dispositivo == null)
        return false;

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.dispositivos";
    $datos_condicionales = [
        "cod_dispositivo" => $cod_dispositivo,
    ];

    $dispositivos = obtenerDispositivos(cod_dispositivo: $cod_dispositivo);
    if (!(
        !empty($dispositivos) &&
        !isset($dispositivos["error"])
    )) return false;

    $delete = eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
    if ($delete === true) {
        foreach ($dispositivos as $disp) {
            eliminarModulosDispositivo($disp->cod_dispositivo);
        }
        /* cambiarEstadoLicenciasServidor($_ENV["ION_SERVER"]); */
    }
    return $delete;
}

function eliminarDispositivosCloud($cod_cloud = null)
{
    if ($cod_cloud == null)
        return false;

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.dispositivos";
    $datos_condicionales = [
        "cod_cloud" => $cod_cloud,
    ];

    $dispositivos = obtenerDispositivos(cod_cloud: $cod_cloud);
    if (!(
        !empty($dispositivos) &&
        !isset($dispositivos["error"])
    )) return false;

    $delete = eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
    if ($delete === true) {
        foreach ($dispositivos as $disp) {
            eliminarModulosDispositivo($disp->cod_dispositivo);
        }
        /* cambiarEstadoLicenciasServidor($_ENV["ION_SERVER"]); */
    }
    return $delete;
}

function addModulosDispositivo($modulos, $cod_dispositivo)
{
    $bd = obtenerConexion();
    $modulosCorrectos = [];
    $modulosIncorrectos = [];

    $sqlValues = "(cod_modulo, cod_dispositivo) VALUES ";
    $values = [];
    foreach ($modulos as $modulo) {
        $canales = obtenerModulosParam(cod_modulo: $modulo);
        $canales = obtenerCanalesModulos($_ENV["ION_SERVER"], $modulo);

        if (
            !$canales ||
            empty($canales) ||
            isset($canales["error"]) ||
            $canales[0]->canales_totales < ($canales[0]->canales_en_uso + 1)
        ) {
            $modulosIncorrectos[] = $modulo;
            continue;
        }

        $sqlValues .= "(?, ?), ";
        $values[] = $modulo;
        $values[] = $cod_dispositivo;
        $modulosCorrectos[] = $canales[0]->nombre_modulo;
    }
    $returnObj = [
        "modulosCorrectos" => $modulosCorrectos,
        "modulosIncorrectos" => $modulosIncorrectos
    ];
    $sqlValues = rtrim($sqlValues, ", ");
    $sql = "INSERT INTO {{.CORE}}.dispositivos_modulos $sqlValues";
    if (!empty($values)) {
        ejecutarConsultaSQL($bd, $sql, $values);
    }

    return $returnObj;
}

function modificarModulosDispositivo($modulos, $cod_dispositivo)
{
    try {
        $bd = obtenerConexion();
        $modulosCorrectos = [];
        $modulosIncorrectos = [];
        $sql = "";

        foreach ($modulos as $modulo) {
            $cod_modulo = $modulo->cod_modulo ?? null;
            $eliminar = $modulo->eliminar ?? false;
            $values = [];

            if ($eliminar == true) {
                $values[] = $cod_modulo;

                if (is_array($cod_dispositivo)) {
                    $cod_dispositivo_sql = "IN (";

                    for ($i = 0; $i < count($cod_dispositivo); $i++) {
                        $cod_dispositivo_sql .= "?, ";
                        $values[] = $cod_dispositivo[$i];
                    }

                    $cod_dispositivo_sql = rtrim($cod_dispositivo_sql, ", ");
                    $cod_dispositivo_sql .= ")";
                } else {
                    $cod_dispositivo_sql = "= ?";
                    $values[] = $cod_dispositivo;
                }

                if (!empty($values)) {
                    $sql = "DELETE FROM {{.CORE}}.dispositivos_modulos 
                    WHERE cod_modulo = ? AND cod_dispositivo $cod_dispositivo_sql;\n";
                }
            } else {
                $canales = obtenerCanalesModulos($_ENV["ION_SERVER"], $cod_modulo);
                if (
                    !$canales ||
                    empty($canales) ||
                    isset($canales["error"]) ||
                    $canales[0]->canales_totales < ($canales[0]->canales_en_uso + 1)
                ) {
                    $modulosIncorrectos[] = $canales[0]->nombre_modulo;
                    continue;
                }

                $modulosCorrectos[] = $canales[0]->nombre_modulo;

                $valuesSql = "(cod_modulo, cod_dispositivo) VALUES ";

                if (!is_array($cod_dispositivo)) {
                    $cod_dispositivo = [$cod_dispositivo];
                }

                foreach ($cod_dispositivo as $cod) {
                    if (existeRelacionModuloDispositivo($cod_modulo, $cod)) {
                        continue;
                    }
                    $valuesSql .= "(?, ?), ";

                    $values[] = $cod_modulo;
                    $values[] = $cod;
                }
                $valuesSql = rtrim($valuesSql, ", ");

                if (!empty($values)) {
                    $sql = "INSERT INTO {{.CORE}}.dispositivos_modulos $valuesSql;\n";
                }
            }

            if (!empty($values)) {
                ejecutarConsultaSQL($bd, $sql, $values);
            }
        }

        return [
            "modulosCorrectos" => $modulosCorrectos,
            "modulosIncorrectos" => $modulosIncorrectos
        ];
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "update", $e);
    }
}

function eliminarModulosDispositivo($cod_dispositivo)
{
    if ($cod_dispositivo == null)
        return false;

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.dispositivos_modulos";
    $datos_condicionales = [
        "cod_dispositivo" => $cod_dispositivo,
    ];

    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function existeRelacionModuloDispositivo(
    $cod_modulo,
    $cod_dispositivo,
) {
    $bd = obtenerConexion();
    $sql = "SELECT * 
    FROM {{.CORE}}.dispositivos_modulos 
    WHERE cod_modulo = ? AND cod_dispositivo = ?";
    $values = [$cod_modulo, $cod_dispositivo];
    try {
        $resultados = ejecutarConsultaSQL($bd, $sql, $values, true);
        if (!empty($resultados)) {
            return true;
        }

        return false;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerDispositivosModuloCount(
    $cod_modulo,
    $estado_canal = null
) {
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT 
			COUNT(DISTINCT d.cod_dispositivo) as total, dm.cod_modulo
		FROM 
			{{.CORE}}.dispositivos d
		LEFT JOIN 
			{{.CORE}}.dispositivos_modulos dm ON d.cod_dispositivo = dm.cod_dispositivo
		WHERE 1 ";

    if ($cod_modulo != null) {
        $sql .= "AND dm.cod_modulo = ? ";
        $values[] = $cod_modulo;
    }

    if ($estado_canal != null) {
        $sql .= "AND dm.estado_canal = ? ";
        $values[] = $estado_canal;
    }
    $sql .= " GROUP BY dm.cod_modulo;";

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerDispositivosModulo(
    $cod_modulo = null,
    $nombre_modulo = null,
    $cod_dispositivo = null,
    $estado_canal = null,
    $fecha_fin_prorroga = null,
) {
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT DISTINCT d.cod_dispositivo, dm.cod_modulo, dm.estado_canal, d.coordenadas
		FROM 
			{{.CORE}}.dispositivos d
		LEFT JOIN 
			{{.CORE}}.dispositivos_modulos dm ON d.cod_dispositivo = dm.cod_dispositivo
		LEFT JOIN 
			{{.CORE}}.modulos m ON m.cod_modulo = dm.cod_modulo
		WHERE 1 ";

    if ($cod_dispositivo != null) {
        $sql .= "AND dm.cod_dispositivo = ? ";
        $values[] = $cod_dispositivo;
    }

    if ($cod_modulo != null) {
        $sql .= "AND dm.cod_modulo = ? ";
        $values[] = $cod_modulo;
    }

    if ($nombre_modulo != null) {
        $sql .= "AND m.nombre_modulo = ? ";
        $values[] = $nombre_modulo;
    }

    if ($estado_canal != null) {
        if (is_array($estado_canal) && !empty($estado_canal)) {
            $sql .= "AND dm.estado_canal IN (";
            foreach ($estado_canal as $est) {
                $sql .= "?, ";
                $values[] = $est;
            }
            $sql = rtrim($sql, ", ") . ") ";
        } else {
            $sql .= "AND dm.estado_canal = ? ";
            $values[] = $estado_canal;
        }
    }

    if ($fecha_fin_prorroga != null) {
        $sql .= "AND dm.fecha_fin_prorroga <= ? ";
        $values[] = $fecha_fin_prorroga;
    }
    $sql .= " GROUP BY d.cod_dispositivo ORDER BY dm.estado_canal DESC;";

    try {
        return ejecutarConsultaSql($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function dispositivoTieneModulos($cod_dispositivo)
{
    $bd = obtenerConexion();
    $values = [];
    $sql =
        "SELECT 
            d.cod_dispositivo,
            COUNT(dm.cod_modulo) AS modulos,
            COUNT(
                CASE WHEN dm.estado_canal != 'caducado' 
                    THEN dm.cod_modulo 
                    ELSE NULL
                END
            ) AS modulos_activos
        FROM 
            {{.CORE}}.dispositivos d
        LEFT JOIN 
            {{.CORE}}.dispositivos_modulos dm ON d.cod_dispositivo = dm.cod_dispositivo
        WHERE 1 ";

    if ($cod_dispositivo != null) {
        $sql .= 'AND d.cod_dispositivo = ? ';
        $values[] = $cod_dispositivo;
    }

    $sql .= 'GROUP BY d.cod_dispositivo;';

    try {
        $modulos = ejecutarConsultaSql($bd, $sql, $values, true)[0];

        return isset($modulos->modulos_activos) && $modulos->modulos_activos > 0;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function dispositivoTieneRadar($cod_dispositivo)
{
    $bd = obtenerConexion();
    $sql = "SELECT COUNT(vr.cod_reconoc) > 0 as total
        FROM {{.CORE}}.vehiculos_reconocidos vr
        WHERE vr.velocidad_vehiculo > 0 AND vr.cod_dispositivo = $cod_dispositivo;";

    $values = [];
    try {
        $velocidad = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $velocidad[0]->total == 1;
    } catch (PDOException) {
        return false;
    }
}


function cambiarEstadoDispositivoModulo(
    $dispositivos,
    $cod_modulo,
    $estado_canal = ESTADOS_CANALES['ESTADO_ACTIVO'],
    $fecha_fin_prorroga = 'VACIAR'
) {
    $nombre_tabla = 'dispositivos_modulos';
    $datos_tabla = [
        'estado_canal' => $estado_canal,
        'fecha_fin_prorroga' => $fecha_fin_prorroga
    ];
    $datos_condicionales = [
        'cod_dispositivo' => $dispositivos,
        'cod_modulo' => $cod_modulo
    ];

    $bd = obtenerConexion();
    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);
}

function obtenerUltimaImagenDispositivos(
    $cod_dispositivo = null,
    $cod_cloud = null,
    $modulos = null
) {
    $bd = obtenerConexion();

    $dispReturn = [];
    $tablas = [
        '{{.CORE}}.vehiculos_reconocidos',
    ];
    $joinMod = 'LEFT JOIN {{.CORE}}.dispositivos_modulos dm ON d.cod_dispositivo = dm.cod_dispositivo ';
    $sqlVR =
        "SELECT DISTINCT d.cod_dispositivo, d.nom_dispositivo, vr.foto, vr.cod_reconoc, cl.cod_cloud, cl.systemId
			FROM {{.CORE}}.dispositivos d
			LEFT JOIN {{.CORE}}.cloud_nx cl ON d.cod_cloud = cl.cod_cloud 
			LEFT JOIN {{.CORE}}.vehiculos_reconocidos vr ON d.cod_dispositivo = vr.cod_dispositivo
			LEFT JOIN (
				SELECT cod_dispositivo, MAX(cod_reconoc) as cod_reconoc
				FROM {{.CORE}}.vehiculos_reconocidos
				GROUP BY cod_dispositivo
				ORDER BY cod_reconoc DESC
			) max_fecha_por_dispositivo ON vr.cod_dispositivo = max_fecha_por_dispositivo.cod_dispositivo 
		";

    if ($modulos != null and !empty($modulos)) {
        $sqlVR .= $joinMod;
    }

    $sqlVR .=
        "WHERE (vr.cod_reconoc = max_fecha_por_dispositivo.cod_reconoc OR vr.cod_reconoc IS NULL) 
        AND dm.estado_canal <> '" . ESTADOS_CANALES['ESTADO_CADUCADO'] . "' ";

    try {
        $i = 0;
        while ($i < count($tablas)) {
            $sql = match ($tablas[$i]) {
                '{{.CORE}}.vehiculos_reconocidos' => $sqlVR,
                default => null
            };

            if (!$sql)
                return [];
            $values = [];
            $where = '';

            if ($cod_dispositivo != null) {
                if (is_array($cod_dispositivo) && !empty($cod_dispositivo)) {
                    $where .= 'AND d.cod_dispositivo IN (';
                    for ($j = 0; $j < count($cod_dispositivo); $j++) {
                        $disp = $cod_dispositivo[$j];

                        if ($disp != null && $disp != '') {
                            $where .= '?, ';
                            $values[] = $disp;
                        }
                    }

                    $where = rtrim($where, ', ');
                    $where .= ')';
                } else {
                    $where .= 'AND d.cod_dispositivo = ? ';
                    $values[] = $cod_dispositivo;
                }
            }

            if ($cod_cloud != null) {
                $where .= 'AND d.cod_cloud = ? ';
                $values[] = $cod_cloud;
            }

            if ($modulos != null and !empty($modulos)) {
                $where .= 'AND dm.cod_modulo IN (';
                for ($j = 0; $j < count($modulos); $j++) {
                    $values[] = $modulos[$j];
                    $where .= '?, ';
                }
                $where = rtrim($where, ', ');
                $where .= ') ';
            }
            $sql .= $where;
            $datos = ejecutarConsultaSQL($bd, $sql, $values, true);

            if (!$datos) {
                $i++;
                continue;
            }

            foreach ($datos as $disp) {
                $cod = $disp->cod_dispositivo;

                $existeEnReturn = array_filter($dispReturn, function ($d) use ($cod) {
                    return $d->cod_dispositivo === $cod;
                });

                if (($disp->foto || $i == count($tablas) - 1) &&
                    empty($existeEnReturn)
                ) {
                    $dispReturn[] = $disp;
                }
            }
            $i++;
        }
        return $dispReturn;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}
