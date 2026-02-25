<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/NX-API/funciones.php";

use Funciones\Devices;
use Funciones\NxConnection;
use Funciones\System;

function guardarStreamAuthKeys($clouds)
{
    $keys = [];
    foreach ($clouds as $cloud) {
        $nx = new NxConnection(
            $cloud->systemId,
            $cloud->ip,
            $cloud->puerto,
            $cloud->user,
            $cloud->password,
        );

        $authKey = System::getNonceToken($nx);

        $fecha = date("Y-m-d");
        $hora = date("h:i:s");

        $keys[] = [
            "systemId" => $cloud->systemId,
            "authKey" => $authKey,
            "insert" => insertarAuthKeyCloud($authKey, $cloud->cod_cloud, $fecha, $hora),
        ];
    }
    return $keys;
}

function insertarAuthKeyCloud(
    $authKey = null,
    $cod_cloud = null,
    $fecha = null,
    $hora = null,
) {
    if (!$authKey) return false;

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.cloud_keys";
    $campos = [
        "authKey" => $authKey,
        "cod_cloud" => $cod_cloud,
        "fecha" => $fecha,
        "hora" => $hora,
    ];
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos);
}

function insertarCloudNx(
    $nombre = null,
    $systemId = null,
    $user = null,
    $password = null,
    $cloud_user = null,
    $cloud_password = null,
    $cod_sector = null
) {
    $bd = obtenerConexion();

    $nombre_tabla = "{{.CORE}}.cloud_nx";
    $campos = [
        "nombre" => $nombre,
        "systemId" => $systemId,
        "user" => $user,
        "password" => $password,
        "cloud_user" => $cloud_user,
        "cloud_password" => $cloud_password,
        "cod_sector" => $cod_sector
    ];
    return insertarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos);
}

function modificarCloudNx(
    $cod_cloud = null,
    $nombre = null,
    $systemId = null,
    $user = null,
    $password = null,
    $cloud_user = null,
    $cloud_password = null,
    $cod_sector = null
) {
    if ($cod_cloud == null)
        return null;

    $bd = obtenerConexion();

    $nombre_tabla = "{{.CORE}}.cloud_nx";
    $campos = [
        "nombre" => $nombre,
        "systemId" => $systemId,
        "user" => $user,
        "password" => $password,
        "cloud_user" => $cloud_user,
        "cloud_password" => $cloud_password,
        "cod_sector" => $cod_sector
    ];
    $campos_condicionales = ["cod_cloud" => $cod_cloud];

    return modificarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos, $campos_condicionales);
}

function eliminarCloudNx($cod_cloud)
{
    if ($cod_cloud == null)
        return false;

    $bd = obtenerConexion();
    $nombre_tabla = "{{.CORE}}.cloud_nx";
    $campos_condicionales = ["cod_cloud" => $cod_cloud];

    $delete = eliminarDatosTabla($bd, __FUNCTION__, $nombre_tabla, $campos_condicionales);

    if ($delete === true) {
        eliminarDispositivosCloud(cod_cloud: $cod_cloud);
    }
    return $delete;
}

function obtenerCloudsParam(
    $cod_cloud = null,
    $nombre = null,
    $systemId = null,
    $user = null,
    $cloud_user = null,
    $permisos_usuario = null,
    $cod_sector = null
) {
    $bd = obtenerConexion();
    $values = [];
    $sql = "SELECT c.*, sv.nombre_sector 
	FROM 
		{{.CORE}}.cloud_nx c
	LEFT JOIN 
		{{.CORE}}.usuarios_permisos_clouds up ON c.cod_cloud = up.cod_cloud OR up.cod_cloud = 0
	LEFT JOIN 
		{{.CORE}}.sectores_verticales sv ON sv.cod_sector = c.cod_sector
	WHERE 1 ";

    if ($cod_cloud) {
        $sql .= "AND c.cod_cloud = ? ";
        $values[] = "$cod_cloud";
    }

    if ($nombre) {
        $sql .= "AND c.nombre LIKE ? ";
        $values[] = "%$nombre%";
    }

    if ($systemId) {
        $sql .= "AND (c.systemId LIKE ? OR c.ip LIKE ?) ";
        $values[] = "%$systemId%";
        $ip = explode(":", $systemId);
        $ip = $ip[0];
        $values[] = "%$ip%";
    }

    if ($user) {
        $sql .= "AND c.user LIKE ? ";
        $values[] = "%$user%";
    }

    if ($cloud_user) {
        $sql .= "AND c.cloud_user LIKE ? ";
        $values[] = "%$cloud_user%";
    }

    if ($permisos_usuario) {
        $sql .= "AND up.cod_permiso = ? ";
        $values[] = "$permisos_usuario";
    }

    if ($cod_sector) {
        $sql .= "AND c.cod_sector = ? ";
        $values[] = "$cod_sector";
    }

    $sql .= "GROUP BY c.cod_cloud ";

    try {
        return ejecutarConsultaSQL($bd, $sql, $values, true);
    } catch (PDOException $e) {
        return errorAlObtenerDatos(__FUNCTION__, "obtener", $e);
    }
}

function obtenerDispositivosSincronizar(
    $cod_cloud = null,
) {
    if (!$cod_cloud) return [];

    $clouds = obtenerCloudsParam($cod_cloud);

    $cloud = $clouds[0] ?? null;
    if (!$cloud || count($clouds) > 1) {
        return ["message" => "Cloud no encontrado", "error" => true];
    }

    $nx = new NxConnection(
        $cloud->systemId,
        $cloud->ip,
        $cloud->puerto,
        $cloud->user,
        $cloud->password,
    );
    $dispositivosNx = $nx->getDevices();
    if (!$dispositivosNx) {
        acabarRequest([
            "message" => "No se han encontrado dispositivos",
            "error" => true,
        ]);
    }

    $dispositivosDB = obtenerDispositivos(
        cod_cloud: $cod_cloud,
    );

    $dispositivosRestantes = [];
    foreach ($dispositivosNx as $dispNx) {
        $filter = array_filter(
            array: $dispositivosDB,
            callback: function ($disp) use ($dispNx) {
                return (
                    $disp->direccion_mac == $dispNx->mac ||
                    $disp->deviceId == trim($dispNx->id, "{}")
                );
            },
        );

        if (empty($filter)) {
            $dispositivosRestantes[] = $dispNx;
        }
    }
    if (empty($dispositivosRestantes)) acabarRequest([]);

    $returnObj = array_map(
        array: $dispositivosRestantes,
        callback: function ($disp) use ($nx) {
            $ip = explode(":", explode("//", $disp->url)[1] ?? "")[0] ?? "";
            $obj = [
                "deviceId" => trim($disp->id, "{}"),
                "name" => $disp->name,
                "mac" => $disp->mac,
                "ip" => $ip,
                "stream" => new stdClass,
            ];

            $tipos_stream = Devices::obtenerTipoGrabacionMomento(
                device: $disp,
                pos: time(),
            );
            if (!$tipos_stream) return $obj;

            $allUrls = Devices::getNxStreamingUrl(
                nx: $nx,
                deviceId: trim($disp->id, "{}"),
            );

            if ($allUrls != null) {
                [$mkv_url, $mp4_url] = $allUrls;

                $obj["stream"] = [
                    "tipos_stream" => $tipos_stream ?? [],
                    "mp4_url" => [
                        "default" => "$mp4_url",
                        "low" => "$mp4_url&stream=1",
                        "high" => "$mp4_url&stream=0"
                    ],
                    "mkv_url" => [
                        "default" => "$mkv_url",
                        "low" => "$mkv_url&stream=1",
                        "high" => "$mkv_url&stream=0"
                    ],
                ];
            }
            return $obj;
        },
    );

    return $returnObj;
}

function insertarDispositivosSincronizar(
    $cod_cloud = null,
    $dispositivos = null,
) {
    if (!(
        $dispositivos &&
        is_array($dispositivos) &&
        !empty($dispositivos)
    )) {
        return ["message" => "Dispositivos inválidos", "error" => true];
    }

    $clouds = obtenerCloudsParam($cod_cloud);

    $cloud = $clouds[0] ?? null;
    if (!$cloud || count($clouds) > 1) {
        return ["message" => "Cloud no encontrado", "error" => true];
    }

    $dispositivosInsertados = [];
    $nx = new NxConnection(
        $cloud->systemId,
        $cloud->ip,
        $cloud->puerto,
        $cloud->user,
        $cloud->password,
    );
    $dispositivosNx = $nx->getDevices();
    if (!$dispositivosNx) {
        return [
            "message" => "No se han encontrado dispositivos",
            "error" => true,
        ];
    }

    $modelos_dispositivos = obtenerModelosMin();
    if (empty($modelos_dispositivos) || isset($modelos_dispositivos["error"])) {
        return [
            "message" => "Error al obtener modelos",
            "error" => true,
            "mod" => $modelos_dispositivos
        ];
    }
    $included = include_once $_SERVER["DOCUMENT_ROOT"] . "/ionindustry/dispositivos/main.php";

    foreach ($dispositivos as $disp) {
        $dispNx = array_filter(
            array: $dispositivosNx,
            callback: function ($dispNx) use ($disp) {
                return strtolower($disp->deviceId) == strtolower(trim($dispNx->id, "{} "));
            },
        );

        if (empty($dispNx)) continue;

        $modelo = array_filter(
            array: $modelos_dispositivos,
            callback: function ($mod) use ($disp) {
                return $mod->cod_modelo == $disp->cod_modelo;
            }
        );
        if (empty($modelo)) {
            $dispositivosInsertados[] = (object)[
                "deviceId" => $disp->deviceId,
                "insert" => [
                    "message" => "Modelo inválido ({$disp->cod_modelo})",
                    "error" => true,
                ],
            ];
            continue;
        }

        $modelo = array_values($modelo)[0];
        if (!isset($disp->direccion) && $disp->coordenadas != null) {
            $disp->coordenadas = validarCoordenadas($disp->coordenadas);
            if ($disp->coordenadas !== false) {
                $disp->direccion = obtenerDireccionCoordenadas($disp->coordenadas);
            }
        }

        $dispNx = array_values($dispNx)[0];
        $serverId = trim($dispNx->serverId, "{} ");
        $serverUrl = $nx->getServerUrl($serverId);

        $ip = explode(":", explode("//", $dispNx->url)[1] ?? "")[0] ?? "";

        $insert = insertarDispositivos(
            nom_dispositivo: $disp->nom_dispositivo,
            direccion: $disp->direccion ?? null,
            coordenadas: $disp->coordenadas,
            serial_number: $disp->serial_number ?? null,
            cod_modelo: $disp->cod_modelo,
            ip_dispositivo: $disp->ip_dispositivo ?? $ip ?? null,
            direccion_mac: $dispNx->mac,
            modulos: $disp->modulos,
            cod_cloud: $cod_cloud,
            deviceId: $disp->deviceId,
            streamUrl: $serverUrl,
        );
        $returnObj = (object)[
            "deviceId" => $disp->deviceId,
            "insert" => $insert,
        ];
        if ($insert["insert"] === true && $insert["cod_dispositivo"] !== null) {
            enviarActualizacionDispositivos("updates", $insert["cod_dispositivo"]);
        }

        if (
            $included && (
                in_array(MODULOS_INDUSTRY[0], $disp->modulos) ||
                in_array(MODULOS_INDUSTRY[1], $disp->modulos) ||
                in_array(MODULOS_INDUSTRY[2], $disp->modulos)
            ) &&
            isset($insert["insert"]) &&
            $insert["insert"] === true
        ) {
            $disp->cod_dispositivo = $insert["cod_dispositivo"] ?? null;
            $insertInd = checkInsertDeviceIndustry(
                $disp,
                $modelo,
            );

            if (!$insertInd || isset($insertInd["error"])) {
                eliminarDispositivos($disp->cod_dispositivo);

                $returnObj->insert = $insertInd;
            }
        }
        $dispositivosInsertados[] = $returnObj;
    }

    return $dispositivosInsertados;
}

function checkInsertDeviceIndustry(
    $disp,
    $modelo,
) {
    if (!(
        isset($disp->cod_nave) &&
        $disp &&
        $modelo &&
        isset($modelo->cod_categoria) &&
        in_array(
            (int)$modelo->cod_categoria,
            [
                CATEGORIAS_DISPOSITIVOS["CAMARA"],
                CATEGORIAS_DISPOSITIVOS["MONITOR"],
            ],
        )
    )) {
        return false;
    }

    $cod_dispositivo = $disp->cod_dispositivo;

    if ((int)$modelo->cod_categoria == CATEGORIAS_DISPOSITIVOS["CAMARA"]) {
        $obj = (object)[
            "cod_camara" => $cod_dispositivo,
            "cod_nave" => $disp->cod_nave,
            "reconocimientos" => $disp->reconocimientos ?? false,
            "pasillos" => $disp->pasillos ?? null,
            "tipo" => "camara",
        ];

        return insertarCamara($obj);
    }

    if ((int)$modelo->cod_categoria == CATEGORIAS_DISPOSITIVOS["MONITOR"]) {
        return insertarMonitor(
            cod_monitor: $cod_dispositivo,
            id_estacion: $disp->id_estacion ?? null,
            cod_modulo: $disp->modulos ?? MODULOS["offices"]["cod_modulo"],
            cod_nave: $disp->cod_nave,
        );
    }

    return false;
}
