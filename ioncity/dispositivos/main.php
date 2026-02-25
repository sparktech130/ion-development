<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/infracciones/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/listas/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/areas/main.php";

function obtenerVelocidadAlertasDispositivo($cod_dispositivo) {
    if (!$cod_dispositivo)
        return null;

    $bd = obtenerConexion();
    if (!dispositivoTieneRadar($cod_dispositivo)) {
        return ['tiene_radar' => false];
    }

    $sql =
        'SELECT d.cod_dispositivo, d.velocidad_max, d.cod_infraccion 
        FROM {{.CITY}}.dispositivos_velocidades d 
        WHERE d.cod_dispositivo = ? ';
    $values = [$cod_dispositivo];

    try {
        $velocidad = ejecutarConsultaSQL($bd, $sql, $values, true);
        return $velocidad;
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, 'obtener', $e);
    }
}

function insertarVelocidadAlertasDispositivo(
    $cod_dispositivo, 
    $velocidad_max, 
    $cod_infraccion,
) {
    $existe = existeInfraccion($cod_infraccion);
    if ($existe !== true) { // No existe
        return $existe;
    }

    $nombre_tabla = '{{.CITY}}.dispositivos_velocidades';
    $datos_tabla = [
        'cod_dispositivo' => $cod_dispositivo,
        'velocidad_max' => $velocidad_max,
        'cod_infraccion' => $cod_infraccion
    ];

    $bd = obtenerConexion();
    $insert = insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla);

    return $insert;
}

function modificarVelocidadAlertasDispositivo(
    $cod_dispositivo = null, 
    $velocidad_max = null, 
    $cod_infraccion = null,
) {
    if (!$cod_dispositivo || !$velocidad_max || !$cod_infraccion)
        return false;

    if (empty(obtenerVelocidadAlertasDispositivo($cod_dispositivo))) {
        return insertarVelocidadAlertasDispositivo($cod_dispositivo, $velocidad_max, $cod_infraccion);
    }

    $nombre_tabla = '{{.CITY}}.dispositivos_velocidades';
    $datos_tabla = [
        'velocidad_max' => $velocidad_max,
        'cod_infraccion' => $cod_infraccion,
    ];
    $datos_condicionales = ['cod_dispositivo' => $cod_dispositivo];

    $bd = obtenerConexion();
    $update = modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_tabla, $datos_condicionales);

    return $update;
}

function eliminarVelocidadAlertasDispositivo($cod_dispositivo) {
    if (!$cod_dispositivo) return false;

    $nombre_tabla = "{{.CITY}}.dispositivos_velocidades";
    $datos_condicionales = ['cod_dispositivo' => $cod_dispositivo];

    $bd = obtenerConexion();
    $delete = eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);

    return $delete;
}

function eliminarAreasRestringidasDispositivo(
    $cod_dispositivo = null,
    $cod_area = null,
) {
    if (!$cod_dispositivo && !$cod_area) return false;

    $nombre_tabla = "{{.CITY}}.dispositivo_area";
    $datos_condicionales = [ 
        "cod_dispositivo" => $cod_dispositivo,
        "cod_area" => $cod_area,
    ];

    $bd = obtenerConexion();
    $delete = eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $datos_condicionales);

    return $delete;
}

function comprobarAreasDispositivos(
    $cod_dispositivo = null,
    $cod_area = null
) {
    $areas = obtenerAreaRestringidaParam(
        cod_area: $cod_area,
    );
    $dispositivos = obtenerDispositivos(
        cod_dispositivo: $cod_dispositivo,
    );

    $nombre_tabla = "{{.CITY}}.dispositivo_area";
    $datos_tabla = [];
    $cods_dispositivo = [];
    $cods_area = [];
    foreach ($dispositivos as $disp) {
        $coordenadas = $disp->coordenadas ?? "";
        $cods_dispositivo[] = $disp->cod_dispositivo;

        $punto = explode(",", $coordenadas);
        if (count($punto) < 2) {
            continue;
        }

        [$puntoFormatado["lat"], $puntoFormatado["lng"]] = $punto;

        if (!(is_array($areas) && !empty($areas))) {
            continue;
        }

        foreach ($areas as $valor) {
            $cod_area = $valor->cod_area;
            $cods_area[] = $cod_area;
            $area = explode(";", $valor->coordenadas);
            $areaFormatada = [];
            foreach ($area as $key => $val) {
                $aux = explode(",", $val);
                $areaFormatada[$key]["lat"] = $aux[0];
                $areaFormatada[$key]["lng"] = $aux[1];
            }

            $estaDentro = comprobarAreaCoordenadas($puntoFormatado, $areaFormatada);
            if (!$estaDentro) {
                continue;
            }

            $datos_tabla[] = [
                "cod_dispositivo" => $disp->cod_dispositivo,
                "cod_area" => $cod_area,
            ];
        }
    }

    $bd = obtenerConexion();
    $returnObj = [
        "vaciado" => eliminarAreasRestringidasDispositivo(
            cod_dispositivo: $cods_dispositivo,
            cod_area: $cods_area,
        ),
        "insert" => insertarMultiplesDatosTabla(
            $bd,
            __FUNCTION__,
            $nombre_tabla,
            $datos_tabla
        ),
    ];
    return $returnObj;
}
