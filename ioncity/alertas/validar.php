<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/alertas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_alerta = $jsonobj2->cod_alerta ?? null;
$estat = $jsonobj2->estat ?? null;
$motivo = $jsonobj2->motivo ?? '';
$cod_infraccion = $jsonobj2->cod_infraccion ?? null;
$usuario = $cod_usuario_token ?? null;

$estados = ["v", "r", "c"];
if (!in_array($estat, $estados)) {
    acabarRequest(["message" => "Error al obtener datos", "error" => true], 500);
}

if ($estat == 'v') {
    $datos_alerta = obtenerAlertas($cod_alerta);

    if (empty($datos_alerta)) {
        return $datos_alerta;
    }

    $fecha_hoy = new DateTime();
    $fecha_hoy->setTimezone(TIME_ZONE);
    $f_modif = $fecha_hoy->format('Y-m-d H:i:s');

    $datos_alerta = $datos_alerta[0];
    $cod_reconoc = $datos_alerta->cod_reconoc;
    $cod_alertagest = $datos_alerta->cod_alertagest;
    $cod_infraccion = $datos_alerta->cod_infraccion ?? null;

    $dispositivo = obtenerDispositivos(
        cod_dispositivo: $datos_alerta->cod_dispositivo,
        modulosFiltro: [MODULOS["infringement"]["cod_modulo"]],
    );
    if (!(
        $dispositivo &&
        !empty($dispositivo) &&
        !isset($dispositivo["error"])
    )) {
        acabarRequest([
            "message" => "El dispositivo no tiene la licencia necesaria.",
            "error" => true,
        ], 500);
    }

    $tipo = '';

    if (
        !$cod_infraccion &&
        isset($datos_alerta->zoneId) &&
        $datos_alerta->zoneId != null
    ) {
        $datos_zona_analysis = obtenerZonasDeteccion($datos_alerta->zoneId);
        $cod_infraccion = $datos_zona_analysis[0]->cod_infraccion ?? null;
    } else if (
        !$cod_infraccion &&
        isset($datos_alerta->cod_area) &&
        $datos_alerta->cod_area != null
    ) {
        $datos_area_restringida = obtenerAreaRestringidaParam(cod_area: $datos_alerta->cod_area);
        $cod_infraccion = $datos_area_restringida[0]->cod_infraccion ?? null;
    } else if ($cod_alertagest == "0001") {
        $datos_disp = obtenerVelocidadAlertasDispositivo($datos_alerta->cod_dispositivo);
        $recon = obtenerReconocimientos($cod_reconoc);

        $tipo = "Circular a {$recon[0]->velocidad_vehiculo} km/h en zona de {$datos_alerta->velocidad_max} km/h";

        $cod_infraccion = $datos_disp[0]->cod_infraccion ?? $datos_disp[0]->cod_infraccion ?? null;
    }

    if ($cod_infraccion === null) {
        acabarRequest([
            "message" => "Error al obtener código de infracción",
            "error" => true,
        ], 500);
    }

    $update = modificarAlertas(
        cod_alerta: $cod_alerta,
        estat: $estat,
        usuario: $usuario,
        motivo: $motivo,
    );

    if ($update == false) {
        acabarRequest(["message" => "Error al obtener datos", "error" => true], 500);
    }

    $estat = 'p';
    $envio = 'p';

    $update = insertarInfraccionVehiculo(
        cod_reconoc: $cod_reconoc,
        cod_alerta: $cod_alerta,
        estat: $estat,
        envio: $envio,
        motivo: $motivo,
        cod_infraccion: $cod_infraccion,
        fecha_modif: $f_modif,
        usuario: $usuario,
        tipo: $tipo
    );
} else if ($estat == 'r' || $estat == 'c') {
    $update = modificarAlertas(
        cod_alerta: $cod_alerta,
        estat: $estat,
        usuario: $usuario,
        motivo: $motivo,
    );
}

acabarRequest($update);
