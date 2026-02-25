<?php
function enviarReconocimientoSocket($cod_reconoc, $cod_dispositivo) {
    if (!$cod_reconoc) {
        return false;
    }

    $reconocimiento = obtenerReconocimientosParamLimitGroupByModulo(
        cod_reconoc: $cod_reconoc, 
        cod_dispositivo: $cod_dispositivo,
    );

    if (empty($reconocimiento)) {
        return false;
    }

    $topic = MQTT_RECONOCIMIENTOS;
    $postData = [
        'recon' => $reconocimiento,
        'server' => $_ENV['ION_SERVER']
    ];
    return enviarDatosBroker($topic, json_encode($postData));
}

function enviarVideoCompartidoSocket($datos_envio) {
    if (!$datos_envio) {
        return false;
    }

    $cod_video = $datos_envio['cod_video'] ?? null;
    $titulo = $datos_envio['titulo'] ?? null;
    $cod_dispositivo = $datos_envio['cod_dispositivo'] ?? null;
    $usuario_inicial = $datos_envio['usuario_inicial'] ?? null;
    $usuario_compartido = $datos_envio['usuario_compartido'] ?? null;
    $nom_dispositivo = $datos_envio['nom_dispositivo'] ?? null;
    $cod_modulo = $datos_envio['cod_modulo'] ?? null;

    $topic = MQTT_VIDEOS_SOCKET;
    $postData = [
        'video' => [
            'cod_video' => $cod_video,
            'titulo' => $titulo,
            'cod_dispositivo' => $cod_dispositivo,
            'nom_dispositivo' => $nom_dispositivo,
            'usuario_inicial' => $usuario_inicial,
            'usuario_compartido' => $usuario_compartido,
            'cod_modulo' => $cod_modulo
        ],
        'server' => $_ENV['ION_SERVER']
    ];
    return enviarDatosBroker($topic, json_encode($postData));
}

