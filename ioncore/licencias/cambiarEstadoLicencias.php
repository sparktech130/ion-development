<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/licencias/main.php";

$fecha_hoy = new DateTime();
$fecha_hoy->setTimezone(TIME_ZONE);
$dateFormat = "Y-m-d";
$int7Dias = new DateInterval("P7D");

$fecha_hoy_format = $fecha_hoy->format($dateFormat);

$fecha_hace_7dias = new DateTime();
$fecha_hace_7dias = $fecha_hace_7dias->sub($int7Dias);
$fecha_hace_7dias_format = $fecha_hace_7dias->format($dateFormat);

$debug = false;

// Obtener licencias para poner en prorroga
$licencias_prorrogar = obtenerLicenciasParam(
    estado: ESTADOS_LICENCIA["ESTADO_LICENCIA_ENUSO"],
    fecha_expiracion_fin: $fecha_hoy_format,
);

if (!empty($licencias_prorrogar) && !isset($licencias_prorrogar["error"])) {
    prorrogarLicencias($licencias_prorrogar);
}

// Obtener licencias para expirar
$licencias_expirar = obtenerLicenciasParam(
    estado: ESTADOS_LICENCIA["ESTADO_LICENCIA_PRORROGA"],
    fecha_expiracion_fin: $fecha_hace_7dias_format,
);

if (!empty($licencias_expirar) && !isset($licencias_expirar["error"])) {
    expirarLicencias($licencias_expirar);
}

// Obtener licencias para activar
$licencias_activar = obtenerLicenciasParam(
    estado: [
        ESTADOS_LICENCIA["ESTADO_LICENCIA_PRORROGA"],
        ESTADOS_LICENCIA["ESTADO_LICENCIA_EXPIRADA"],
        ESTADOS_LICENCIA["ESTADO_LICENCIA_ELIMINADA"]
    ],
    fecha_mayor: $fecha_hoy_format,
);

if (!empty($licencias_activar) && !isset($licencias_activar["error"])) {
    activarLicencias($licencias_activar);
}

// Obtener canales licencias y comparar con dispositivos.
$canales_licencias = obtenerCanalesModulos($_ENV["ION_SERVER"]);

$fecha_fin_prorroga = new DateTime();
$fecha_fin_prorroga = $fecha_fin_prorroga->add($int7Dias);
$fecha_fin_prorroga = $fecha_fin_prorroga->format($dateFormat);

foreach ($canales_licencias as $canal) {
    $dispositivos_activacion = [];
    $dispositivos_prorrogar = [];
    $dispositivos_cad = [];

    $cod_modulo = $canal->cod_modulo;

    if ($debug) {
        echo $cod_modulo . ": \n";
    }

    if (
        ($canal->canales_en_uso + count($canal->dispositivos_prorroga)) <= $canal->canales_totales
        || $canal->canales_en_uso < $canal->canales_validos
    ) {
        $canal->sobrantes = $canal->canales_totales - $canal->canales_en_uso;
        $canal->validoSobrantes = $canal->canales_validos - $canal->canales_en_uso;

        $dispositivos = obtenerDispositivosModulo($cod_modulo, null, null, [
            ESTADOS_CANALES["ESTADO_PRORROGA"],
            ESTADOS_CANALES["ESTADO_CADUCADO"]
        ]);
        if (!(empty($dispositivos) || isset($dispositivos["error"]))) {
            foreach ($dispositivos as $disp) {
                if ($canal->validoSobrantes > 0) {
                    $dispositivos_activacion[] = $disp->cod_dispositivo;

                    $canal->sobrantes--;
                    $canal->validoSobrantes--;
                    $canal->canales_en_uso++;
                } else if (
                    $disp->estado_canal == ESTADOS_CANALES["ESTADO_CADUCADO"]
                    && $canal->sobrantes > 0
                ) {
                    $dispositivos_prorrogar[] = $disp->cod_dispositivo;
                    $canal->sobrantes--;
                }
            }

            if (!empty($dispositivos_activacion)) {
                cambiarEstadoDispositivoModulo($dispositivos_activacion, $cod_modulo, ESTADOS_CANALES["ESTADO_ACTIVO"]);

                if ($debug) {
                    echo "activar: \n";
                    echo json_encode($dispositivos_activacion) . "\n";
                }
            }
        }
    } else {
        $canal->sobrantes =
            $canal->canales_en_uso
            + count($canal->dispositivos_prorroga)
            - $canal->canales_totales;

        $canal->invalidar = $canal->canales_validos - $canal->canales_en_uso;

        // Caducar dispositivos
        $dispositivosCaducar = obtenerDispositivosModulo(
            cod_modulo: $cod_modulo,
            estado_canal: [
                ESTADOS_CANALES["ESTADO_PRORROGA"],
                ESTADOS_CANALES["ESTADO_ACTIVO"],
            ],
        );
        foreach ($dispositivosCaducar as $disp) {
            if ($canal->sobrantes > 0) {
                $dispositivos_cad[] = $disp->cod_dispositivo;
                $canal->sobrantes--;
                if ($disp->estado_canal === ESTADOS_CANALES["ESTADO_ACTIVO"]) {
                    $canal->canales_en_uso--;
                }
            }
        }

        if (!empty($dispositivos_cad)) {
            cambiarEstadoDispositivoModulo(
                $dispositivos_cad,
                $cod_modulo,
                ESTADOS_CANALES["ESTADO_CADUCADO"],
                null
            );
        }

        if ($debug) {
            echo "caducar: \n";
            echo json_encode($dispositivos_cad) . "\n";
        }
    }

    if (!empty($dispositivos_prorrogar)) {
        cambiarEstadoDispositivoModulo(
            $dispositivos_prorrogar,
            $cod_modulo,
            ESTADOS_CANALES["ESTADO_PRORROGA"],
            $fecha_fin_prorroga
        );

        if ($debug) {
            echo "prorrogar 1 fin: {$fecha_fin_prorroga}: \n";
            echo json_encode($dispositivos_prorrogar) . "\n";
        }
    }

    $dispositivos_prorrogar = [];

    // Cantidad de dispositivos que sobrepasan los canales disponibles
    $sobrantes = $canal->canales_en_uso - $canal->canales_validos;
    if ($sobrantes <= 0)
        continue;

    // Prorrogar canales con fecha fin de la prorroga (7 días)
    // Obtener dispositivos del modulo segun las cantidades sobrantes
    $dispositivos = obtenerDispositivosModulo($cod_modulo, null, null, ESTADOS_CANALES["ESTADO_ACTIVO"]);
    if (empty($dispositivos) || isset($dispositivos["error"]))
        continue;

    foreach ($dispositivos as $disp) {
        if ($sobrantes > 0) {
            $dispositivos_prorrogar[] = $disp->cod_dispositivo;
            $sobrantes--;
        }
    }

    if (!empty($dispositivos_prorrogar)) {
        cambiarEstadoDispositivoModulo(
            $dispositivos_prorrogar,
            $cod_modulo,
            ESTADOS_CANALES["ESTADO_PRORROGA"],
            $fecha_fin_prorroga
        );

        if ($debug) {
            echo "prorrogar 2 fin: {$fecha_fin_prorroga}: \n";
            echo json_encode($dispositivos_prorrogar) . "\n";
        }
    }

    // Obtener dispositivos con prorroga y fecha_fin anterior a la de hoy
    // Expirar la prorroga, estado "caducado"
    $dispositivos_cad = [];
    $dispositivosCaducar = obtenerDispositivosModulo(
        cod_modulo: $cod_modulo,
        estado_canal: ESTADOS_CANALES["ESTADO_PRORROGA"],
        fecha_fin_prorroga: $fecha_hoy_format
    );
    foreach ($dispositivosCaducar as $disp) {
        $dispositivos_cad[] = $disp->cod_dispositivo;
    }

    if (!empty($dispositivos_cad)) {
        cambiarEstadoDispositivoModulo(
            $dispositivos_cad,
            $cod_modulo,
            ESTADOS_CANALES["ESTADO_CADUCADO"],
            null
        );

        if ($debug) {
            echo "caducar 2 de fecha_fin {$fecha_hoy_format}: \n";
            echo json_encode($dispositivos_cad) . "\n";
        }
    }
}

