<?php

function enviarAlertaSocket($cod_alerta) {
    $alertas = [];
    if (is_array($cod_alerta)) {
        foreach ($cod_alerta as $al) {
            $alerta = ['modulo' => $al['modulo']];
            $alertaEnviar = obtenerAlertasGeneral($al['cod'])[0] ?? [];

            $addAlert = false;
            if (!empty($alertaEnviar)) {
                $comprobacion = obtenerDispositivosModulo(
                    nombre_modulo: $al['modulo'],
                    cod_dispositivo: $alertaEnviar->cod_dispositivo,
                    estado_canal: [
                        ESTADOS_CANALES['ESTADO_ACTIVO'],
                        ESTADOS_CANALES['ESTADO_PRORROGA']
                    ]
                );

                $addAlert = !empty($comprobacion) && !isset($comprobacion['error']);
            }

            if ($al['modulo'] == 'traffic')
                $alerta['alerta'] = $alertaEnviar;
            else if ($al['modulo'] == 'mobility')
                $alerta['alerta'] = $alertaEnviar;

            if ($addAlert)
                $alertas[] = $alerta;
        }
    } else {
        $alertaEnviar = obtenerAlertasGeneral($cod_alerta)[0] ?? [];

        if (!empty($alertaEnviar)) {
            $alertas[] = [
                'modulo' => $alertaEnviar->modulo,
                'alerta' => $alertaEnviar
            ];
        }
    }

    if (empty($alertas)) {
        return false;
    }

    $topic = MQTT_ALERTAS;

    $postData = [
        'alertas' => $alertas,
        'server' => $_ENV['ION_SERVER']
    ];

    return enviarDatosBroker($topic, json_encode($postData));
}

