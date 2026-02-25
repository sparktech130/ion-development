<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

use CVUtils\Utils;
use Funciones\Area;
use Funciones\Instancia;

function obtenerAnalisis($type = null)
{
    $sql =
        "SELECT 
            a.*
		FROM 
			{{.CORE}}.analysis a
		WHERE 1 ";
    $values = [];

    if ($type) {
        $sql .= 'AND a.type = ? ';
        $values[] = $type;
    }

    try {
        $bd = obtenerConexion();
        $registros = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $registros;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerAnalisisAreas(
    $cod_modulo = null,
    $cod_categoria = null,
    $nombre_categoria = null,
) {
    $sql =
        "SELECT 
            am.cod_rel, a.*, am.cod_modulo, m.nombre_modulo, am.name, 
            am.description, am.cod_tipo_area, am.cod_categoria, cat.nombre_categoria
		FROM 
			{{.CORE}}.analysis a
		LEFT JOIN
			{{.CORE}}.analysis_modulos am ON a.cod_ai = am.cod_ai
		LEFT JOIN
			{{.CORE}}.modulos m ON am.cod_modulo = m.cod_modulo
		LEFT JOIN
			{{.CORE}}.fabricantes_categoria cat ON cat.cod_categoria = am.cod_categoria
		WHERE 1 ";
    $values = [];

    if ($cod_modulo) {
        $sql .= 'AND am.cod_modulo = ? ';
        $values[] = $cod_modulo;
    }

    if ($cod_categoria) {
        $sql .= 'AND cat.cod_categoria = ? ';
        $values[] = $cod_categoria;
    }

    if ($nombre_categoria) {
        $sql .= 'AND cat.nombre_categoria LIKE ? ';
        $values[] = "%$nombre_categoria%";
    }

    $sql .= 'GROUP BY am.cod_rel; ';

    try {
        $bd = obtenerConexion();
        $registros = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $registros;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function obtenerTiposAreaAnalisisParam($cod_modulo)
{
    $sql =
        "SELECT 
			ta.*
		FROM 
			{{.CORE}}.analysis_tipo_area ta
		WHERE 1 ";
    $values = [];

    if ($cod_modulo) {
        $sql .= "AND ta.cod_modulo = ? ";
        $values[] = $cod_modulo;
    }

    try {
        $bd = obtenerConexion();
        $tipos = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $tipos;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerCoordenadasZona($instanceName = null, $zoneId = null, $solutionId = "securt")
{
    if (!($instanceName && $zoneId))
        return null;

    $clouds = obtenerCloudsAnalysis(deviceId: $instanceName);
    if (!(
        is_array($clouds) &&
        !empty($clouds) &&
        count($clouds) == 1 &&
        !isset($clouds["error"])
    )) {
        return null;
    }

    $c = $clouds[0];

    $i = new Instancia(Utils::obtenerServer($c->ip, $c->puerto));
    $a = new Area($i);

    $instancias = $i->instances("GET");

    $obtenerInstancia = function ($instancias) use ($instanceName, $solutionId) {
        foreach ($instancias as $instancia) {
            if ($instancia["displayName"] === $instanceName && $instancia["solutionId"] === $solutionId) {
                return $instancia;
            }
        }
        return null;
    };
    $instance = $obtenerInstancia($instancias["instances"]);

    if (!$instance)
        return null;

    $zona = $a->obtener_area($instance["instanceId"], $zoneId);
    return $zona["coordinates"] ?? [];
}

function obtenerZonasDeteccion(
    $zoneId = null,
    $cod_dispositivo = null,
    $instanceId = null,
    $crowdest = false
) {
    $sql =
        "SELECT 
            z.*, ta.desc_tipo_area, 
            /* ta.cod_alertagest, ag.nombre_alerta,  */
            ta.cod_modulo, aly.type as ion_type
		FROM 
			{{.CORE}}.analysis_zona_deteccion z
        LEFT JOIN
			{{.CORE}}.analysis_cloud_instancias inst
                ON z.instanceId = inst.instanceId
		LEFT JOIN
			{{.CORE}}.analysis_tipo_area ta ON z.cod_tipo_area = ta.cod_tipo_area
		LEFT JOIN
			{{.CORE}}.analysis aly ON aly.cod_ai = z.cod_ai
		/* LEFT JOIN */
		/* 	{{.CORE}}.alertas_gestion ag ON ag.cod_alertagest = ta.cod_alertagest */
		";
    $values = [];
    $where = "WHERE 1 ";

    if ($crowdest) {
        $sql .=
            "LEFT JOIN 
                {{.CORE}}.analysis_modulos amod ON (amod.cod_tipo_area = ta.cod_tipo_area AND amod.cod_modulo = ta.cod_modulo)
            LEFT JOIN
                {{.CORE}}.analysis aly ON aly.cod_ai = amod.cod_ai 
                ";
        $where .= "AND aly.type = ? ";
        $values[] = "crowd-estimation";
    }

    if ($zoneId) {
        $where .= "AND z.zoneId = ? ";
        $values[] = $zoneId;
    }

    if ($cod_dispositivo) {
        $where .= "AND inst.cod_dispositivo = ? ";
        $values[] = $cod_dispositivo;
    }

    if ($instanceId) {
        $where .= "AND inst.instanceId = ? ";
        $values[] = $instanceId;
    }

    $sql .= " {$where} GROUP BY z.zoneId";

    try {
        $bd = obtenerConexion();
        $zonas = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $zonas;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function insertarZonaDeteccion(
    $zoneId,
    $instanceId,
    $cod_tipo_area,
    $cod_ai,
    $solution = "securt",
    $cod_infraccion = null,
    $extra_data = null,
) {
    $nombre_tabla = "{{.CORE}}.analysis_zona_deteccion";
    $datos_tabla = [
        "zoneId" => $zoneId,
        "instanceId" => $instanceId,
        "cod_tipo_area" => $cod_tipo_area,
        "cod_ai" => $cod_ai,
        "solution" => $solution,
        "cod_infraccion" => $cod_infraccion,
        "extra_data" => $extra_data,
    ];

    $bd = obtenerConexion();
    $insert = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, false, false);

    if ($insert === true && $solution === "crowd-estimation")
        modificarZonaDeteccion($zoneId, $instanceId, $cod_tipo_area, $cod_ai, $solution);

    if ($insert === true) {
        enviarActualizacionZonasDeteccion("updates", $zoneId);
    }

    return $insert;
}

function modificarZonaDeteccion(
    $zoneId,
    $instanceId,
    $cod_tipo_area,
    $cod_ai,
    $solution = "securt",
    $cod_infraccion = null,
    $extra_data = null,
) {
    if (!$zoneId)
        return false;

    $zona = obtenerZonasDeteccion(zoneId: $zoneId);
    $existeZona = !(empty($zona) || isset($zona["error"]));

    if (!$existeZona) {
        return insertarZonaDeteccion($zoneId, $instanceId, $cod_tipo_area, $cod_ai, $solution, $cod_infraccion);
    }

    $nombre_tabla = "{{.CORE}}.analysis_zona_deteccion";
    $datos_tabla = [
        "instanceId" => $instanceId,
        "cod_tipo_area" => $cod_tipo_area,
        "cod_ai" => $cod_ai,
        "solution" => $solution,
        "cod_infraccion" => $cod_infraccion,
        "extra_data" => $extra_data,
    ];

    $datos_condicionales = [
        "zoneId" => $zoneId
    ];

    if ($solution === "crowd-estimation")
        $datos_condicionales = [
            "instanceId" => $instanceId,
            "solution" => $solution
        ];

    $bd = obtenerConexion();
    $update = modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);

    if ($update === true) {
        enviarActualizacionZonasDeteccion("updates", $zoneId);
    }

    return $update;
}

function eliminarZonaDeteccion($zoneId)
{
    if (!$zoneId)
        return false;

    $nombre_tabla = "{{.CORE}}.analysis_zona_deteccion";
    $datos_condicionales = [
        "zoneId" => $zoneId
    ];

    $bd = obtenerConexion();
    $delete = eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
    if ($delete === true) {
        enviarActualizacionZonasDeteccion("deletes", $zoneId);
    }

    return $delete;
}

function obtenerCloudsAnalysis(
    $cod_cloud = null,
    $instanceId = null,
    $cod_dispositivo = null,
    $deviceId = null,
    $activo = null,
) {
    $sql =
        "SELECT 
            ac.cod_cloud_analysis, ac.ip, ac.puerto,
            IFNULL(COUNT(aci.instanceId), 0) as instancias, ac.canales
		FROM 
			{{.CORE}}.analysis_cloud ac
		LEFT JOIN
            {{.CORE}}.analysis_cloud_instancias aci 
                ON ac.cod_cloud_analysis = aci.cod_cloud_analysis
		LEFT JOIN
            {{.CORE}}.dispositivos d 
                ON d.cod_dispositivo = aci.cod_dispositivo
		";
    $values = [];
    $where = "WHERE 1 ";

    if ($cod_cloud) {
        $where .= "AND ac.cod_cloud_analysis = ? ";
        $values[] = $cod_cloud;
    }

    if ($instanceId) {
        $where .= "AND aci.instanceId = ? ";
        $values[] = $instanceId;
    }

    if ($cod_dispositivo) {
        $where .= "AND aci.cod_dispositivo = ? ";
        $values[] = $cod_dispositivo;
    }

    if ($deviceId) {
        $where .= "AND d.deviceId = ? ";
        $values[] = $deviceId;
    }

    if ($activo) {
        $where .= "AND ac.activo = ? ";
        $values[] = $activo;
    }

    $sql .= $where;
    $sql .= " GROUP BY ac.cod_cloud_analysis;";

    try {
        $bd = obtenerConexion();
        $rows = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $rows;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerCloudOptimoInsertar()
{
    $cloud = null;
    $canalesLibres = 0;

    $clouds = obtenerCloudsAnalysis(activo: true);
    if (!(
        is_array($clouds) &&
        !empty($clouds) &&
        !isset($clouds["error"])
    )) {
        return null;
    }

    foreach ($clouds as $c) {
        $localCanalesLibres = $c->canales - $c->instancias;
        if ($localCanalesLibres <= 0) {
            continue;
        }

        if ($localCanalesLibres > $canalesLibres) {
            $cloud = $c;
            $canalesLibres = $localCanalesLibres;
        }
    }

    return $cloud;
}


function insertarInstanciaCloud(
    $instanceId = null,
    $solution_code = null,
    $cod_dispositivo = null,
    $cod_cloud_analysis = null,
    $alpr = false,
) {
    $nombre_tabla = "{{.CORE}}.analysis_cloud_instancias";
    $datos_tabla = [
        "instanceId" => $instanceId,
        "solution_code" => $solution_code,
        "cod_dispositivo" => $cod_dispositivo,
        "cod_cloud_analysis" => $cod_cloud_analysis,
        "ALPR" => $alpr,
    ];
    $bd = obtenerConexion();
    $insert = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, false, false);

    return $insert;
}

function modificarInstanciaCloud(
    $instanceId = null,
    $solution_code = null,
    $cod_dispositivo = null,
    $cod_cloud_analysis = null,
    $alpr = null,
) {
    $nombre_tabla = "{{.CORE}}.analysis_cloud_instancias";
    $datos_tabla = [
        "solution_code" => $solution_code,
        "cod_dispositivo" => $cod_dispositivo,
        "cod_cloud_analysis" => $cod_cloud_analysis,
        "ALPR" => $alpr,
    ];
    $datos_condicionales = [
        "instanceId" => $instanceId,
    ];

    $bd = obtenerConexion();
    $update = modificarDatosTabla(
        $bd,
        __FUNCTION__,
        $nombre_tabla,
        $datos_tabla,
        $datos_condicionales,
    );

    return $update;
}

function eliminarInstanciaCloud($instanceId = null)
{
    if ($instanceId === null || $instanceId === "") {
        return false;
    }

    $nombre_tabla = "{{.CORE}}.analysis_cloud_instancias";
    $datos_condicionales = ["instanceId" => $instanceId];

    $bd = obtenerConexion();
    return eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);
}

function obtenerDispositivosCloudAnalysis(
    $cod_dispositivo = null,
    $instanceId = null,
    $cod_cloud = null,
    $activo = null,
) {
    $sql =
        "SELECT 
            ac.cod_cloud_analysis, ac.ip, ac.puerto, aci.instanceId,
            d.cod_dispositivo, d.nom_dispositivo
		FROM 
			{{.CORE}}.analysis_cloud ac
		LEFT JOIN
            {{.CORE}}.analysis_cloud_instancias aci 
                ON ac.cod_cloud_analysis = aci.cod_cloud_analysis
		LEFT JOIN
            {{.CORE}}.dispositivos d 
                ON d.cod_dispositivo = aci.cod_dispositivo
		";
    $values = [];
    $where = "WHERE 1 ";

    if ($cod_dispositivo) {
        $where .= "AND aci.cod_dispositivo = ? ";
        $values[] = $cod_dispositivo;
    }

    if ($instanceId) {
        $where .= "AND aci.instanceId = ? ";
        $values[] = $instanceId;
    }

    if ($cod_cloud) {
        $where .= "AND ac.cod_cloud_analysis = ? ";
        $values[] = $cod_cloud;
    }

    if ($activo != null) {
        $where .= "AND ac.activo = ? ";
        $values[] = $activo;
    }

    $sql .= $where;

    try {
        $bd = obtenerConexion();
        $rows = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $rows;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}
