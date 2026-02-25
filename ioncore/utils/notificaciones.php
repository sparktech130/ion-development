<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/consts.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/core/mail.php';

/**
 * Envía notificaciones a los destinatarios de una lista tras detectar un reconocimiento
 * 
 * @param array $reconocimiento Datos del reconocimiento (matrícula, dispositivo, fecha, hora, etc.)
 * @param array $destinatarios Lista de destinatarios obtenidos por matrícula
 * @return array Resultados del envío por cada destinatario
 */
function enviarNotificacionLista($reconocimiento, $destinatarios)
{
    if (empty($destinatarios) || !is_array($destinatarios)) {
        EscribirLog("No hay destinatarios para notificar.");
        return [];
    }

    $resultados = [];

    foreach ($destinatarios as $destinatario) {
        $canal = $destinatario->canal ?? 'email';
        $resultado = [
            'destinatario' => $destinatario->destinatario ?? '',
            'canal' => $canal,
            'nombre' => $destinatario->nombre ?? '',
            'exito' => false,
            'mensaje' => '',
        ];

        try {
            switch ($canal) {
                case 'email':
                    $resultado['exito'] = enviarNotificacionEmail($reconocimiento, $destinatario);
                    $resultado['mensaje'] = $resultado['exito'] ? 'Email enviado' : 'Error al enviar email';
                    break;

                case 'sms':
                    $resultado['exito'] = enviarNotificacionSMS($reconocimiento, $destinatario);
                    $resultado['mensaje'] = $resultado['exito'] ? 'SMS simulado' : 'Error al simular SMS';
                    break;

                case 'whatsapp':
                    $resultado['exito'] = enviarNotificacionWhatsapp($reconocimiento, $destinatario);
                    $resultado['mensaje'] = $resultado['exito'] ? 'WhatsApp simulado' : 'Error al simular WhatsApp';
                    break;

                default:
                    $resultado['mensaje'] = "Canal desconocido: {$canal}";
                    EscribirLog("Canal desconocido para destinatario: {$canal}", "error");
                    break;
            }
        } catch (Exception $e) {
            $resultado['mensaje'] = "Excepción: " . $e->getMessage();
            EscribirLog(
                "Error al enviar notificación ({$canal}) a {$destinatario->destinatario}: {$e->getMessage()}",
                "error"
            );
        }

        $resultados[] = $resultado;

        // Log del resultado
        if ($resultado['exito']) {
            EscribirLog(
                "Notificación enviada via {$canal} a {$destinatario->destinatario} para matrícula {$reconocimiento['matricula']}"
            );
        }
    }

    return $resultados;
}

/**
 * Envía una notificación por email sobre un reconocimiento
 * 
 * @param array $reconocimiento Datos del reconocimiento
 * @param object $destinatario Datos del destinatario
 * @return bool True si se envió correctamente
 */
function enviarNotificacionEmail($reconocimiento, $destinatario)
{
    $matricula = $reconocimiento['matricula'] ?? '';
    $dispositivo = $reconocimiento['nom_dispositivo'] ?? '';
    $fecha = $reconocimiento['fecha'] ?? '';
    $hora = $reconocimiento['hora'] ?? '';
    $nombre_lista = $destinatario->nombre_lista ?? 'Lista';

    $subject = "{$nombre_lista}: {$matricula}";

    $body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #b22e24; color: white; padding: 15px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #b22e24; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Reconocimiento de Matrícula</h2>
            </div>
            <div class='content'>
                <div class='info-row'>
                    <span class='label'>Matrícula:</span> {$matricula}
                </div>
                <div class='info-row'>
                    <span class='label'>Lista:</span> {$nombre_lista}
                </div>
                <div class='info-row'>
                    <span class='label'>Dispositivo:</span> {$dispositivo}
                </div>
                <div class='info-row'>
                    <span class='label'>Fecha:</span> {$fecha}
                </div>
                <div class='info-row'>
                    <span class='label'>Hora:</span> {$hora}
                </div>
    ";

    if (!empty($reconocimiento['foto'])) {
        $url_foto = "https://{$_ENV['ION_SERVER']}" ?? 'http://localhost';
        $body .= "
                <div class='info-row'>
                    <span class='label'>Imagen:</span> 
                    <a href='{$url_foto}/core/fotos/{$reconocimiento['foto']}'>Ver imagen</a>
                </div>
        ";
    }

    $body .= "
            </div>
            <div class='footer'>
                <p>Este es un mensaje automático del sistema de reconocimiento de matrículas.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    try {
        return enviarCorreo(
            subject: $subject,
            body: $body,
            address: $destinatario->destinatario,
            isHTML: true
        );
    } catch (Exception $e) {
        EscribirLog(
            "Error al enviar email a {$destinatario->destinatario}: {$e->getMessage()}",
            "error"
        );
        return false;
    }
}

/**
 * Simula el envío de una notificación por SMS
 * 
 * @param array $reconocimiento Datos del reconocimiento
 * @param object $destinatario Datos del destinatario
 * @return bool True (simulado)
 */
function enviarNotificacionSMS($reconocimiento, $destinatario)
{
    $matricula = $reconocimiento['matricula'] ?? '';
    $dispositivo = $reconocimiento['nom_dispositivo'] ?? '';
    $fecha = $reconocimiento['fecha'] ?? '';
    $hora = $reconocimiento['hora'] ?? '';

    $mensaje = "Alerta: Matrícula {$matricula} detectada en {$dispositivo} el {$fecha} a las {$hora}";

    EscribirLog(
        "[SMS SIMULADO] Enviando a {$destinatario->destinatario}: {$mensaje}"
    );

    // TODO: Integrar con servicio SMS real (Twilio, Nexmo, etc.)
    // Ejemplo placeholder:
    // $smsService = new SMSProvider($_ENV['SMS_API_KEY']);
    // return $smsService->send($destinatario->destinatario, $mensaje);

    return true; // Simulado como exitoso
}

/**
 * Simula el envío de una notificación por WhatsApp
 * 
 * @param array $reconocimiento Datos del reconocimiento
 * @param object $destinatario Datos del destinatario
 * @return bool True (simulado)
 */
function enviarNotificacionWhatsapp($reconocimiento, $destinatario)
{
    $matricula = $reconocimiento['matricula'] ?? '';
    $dispositivo = $reconocimiento['nom_dispositivo'] ?? '';
    $fecha = $reconocimiento['fecha'] ?? '';
    $hora = $reconocimiento['hora'] ?? '';
    $nombre_lista = $destinatario->nombre_lista ?? 'Lista';

    $mensaje = "🚗 *Alerta de Reconocimiento*\n\n";
    $mensaje .= "Matrícula: *{$matricula}*\n";
    $mensaje .= "Lista: {$nombre_lista}\n";
    $mensaje .= "Dispositivo: {$dispositivo}\n";
    $mensaje .= "Fecha: {$fecha}\n";
    $mensaje .= "Hora: {$hora}";

    EscribirLog(
        "[WHATSAPP SIMULADO] Enviando a {$destinatario->destinatario}: {$mensaje}"
    );

    // TODO: Integrar con API de WhatsApp Business (Twilio, Meta, etc.)
    // Ejemplo placeholder:
    // $whatsappService = new WhatsAppProvider($_ENV['WHATSAPP_API_KEY']);
    // return $whatsappService->send($destinatario->destinatario, $mensaje);

    return true; // Simulado como exitoso
}

// ===== NOTIFICACIONES HISTÓRICAS =====

/**
 * Envía notificaciones históricas a destinatarios con reconocimientos pasados
 * 
 * @param array $destinatarios Lista de destinatarios
 * @param array $reconocimientos Lista de reconocimientos históricos
 * @param array $contexto Contexto de la notificación ['tipo', 'lista', 'matricula']
 * @return array Resultados del envío
 */
function enviarNotificacionHistorica($destinatarios, $reconocimientos, $contexto)
{
    if (empty($destinatarios) || !is_array($destinatarios)) {
        EscribirLog("No hay destinatarios para notificación histórica.");
        return [];
    }

    if (empty($reconocimientos) || !is_array($reconocimientos)) {
        EscribirLog("No hay reconocimientos históricos para notificar.");
        return [];
    }

    $tipo = $contexto['tipo'] ?? 'desconocido';
    /* $nombre_lista = $contexto['lista'] ?? 'Lista'; */
    /* $matricula = $contexto['matricula'] ?? null; */

    EscribirLog(
        "Iniciando envío de notificaciones históricas: " . count($reconocimientos) .
            " reconocimientos a " . count($destinatarios) . " destinatarios. Tipo: {$tipo}"
    );

    $resultados = [];

    foreach ($destinatarios as $destinatario) {
        $canal = $destinatario->canal ?? 'email';
        $resultado = [
            'destinatario' => $destinatario->destinatario ?? '',
            'canal' => $canal,
            'nombre' => $destinatario->nombre ?? '',
            'exito' => false,
            'mensaje' => '',
        ];

        try {
            switch ($canal) {
                case 'email':
                    $resultado['exito'] = enviarNotificacionEmailHistorico(
                        $reconocimientos,
                        $destinatario,
                        $contexto
                    );
                    $resultado['mensaje'] = $resultado['exito'] ? 'Email histórico enviado' : 'Error al enviar email';
                    break;

                case 'sms':
                    $resumen = generarResumenReconocimientos($reconocimientos);
                    $resultado['exito'] = enviarNotificacionSMSHistorico($resumen, $destinatario, $contexto);
                    $resultado['mensaje'] = $resultado['exito'] ? 'SMS histórico simulado' : 'Error al simular SMS';
                    break;

                case 'whatsapp':
                    $resumen = generarResumenReconocimientos($reconocimientos);
                    $resultado['exito'] = enviarNotificacionWhatsappHistorico($resumen, $destinatario, $contexto);
                    $resultado['mensaje'] = $resultado['exito'] ? 'WhatsApp histórico simulado' : 'Error al simular WhatsApp';
                    break;

                default:
                    $resultado['mensaje'] = "Canal desconocido: {$canal}";
                    EscribirLog("Canal desconocido para notificación histórica: {$canal}", "error");
                    break;
            }
        } catch (Exception $e) {
            $resultado['mensaje'] = "Excepción: " . $e->getMessage();
            EscribirLog(
                "Error al enviar notificación histórica ({$canal}) a {$destinatario->destinatario}: {$e->getMessage()}",
                "error"
            );
        }

        $resultados[] = $resultado;

        if ($resultado['exito']) {
            EscribirLog(
                "Notificación histórica enviada via {$canal} a {$destinatario->destinatario}: " .
                    count($reconocimientos) . " reconocimientos"
            );
        }
    }

    return $resultados;
}

/**
 * Genera resumen de reconocimientos para SMS/WhatsApp
 * 
 * @param array $reconocimientos Lista de reconocimientos
 * @return array Resumen con contadores y fechas
 */
function generarResumenReconocimientos($reconocimientos)
{
    if (empty($reconocimientos)) {
        return [
            'total' => 0,
            'fecha_min' => null,
            'fecha_max' => null,
            'matriculas' => []
        ];
    }

    $matriculas = [];
    $fecha_min = null;
    $fecha_max = null;

    foreach ($reconocimientos as $recon) {
        $mat = $recon->matricula ?? '';
        if (!isset($matriculas[$mat])) {
            $matriculas[$mat] = 0;
        }
        $matriculas[$mat]++;

        $fecha = $recon->fecha ?? null;
        if ($fecha) {
            if ($fecha_min === null || $fecha < $fecha_min) {
                $fecha_min = $fecha;
            }
            if ($fecha_max === null || $fecha > $fecha_max) {
                $fecha_max = $fecha;
            }
        }
    }

    return [
        'total' => count($reconocimientos),
        'fecha_min' => $fecha_min,
        'fecha_max' => $fecha_max,
        'matriculas' => $matriculas
    ];
}

/**
 * Genera tabla HTML con reconocimientos históricos
 * 
 * @param array $reconocimientos Lista de reconocimientos
 * @param array $contexto Contexto de la notificación
 * @return string HTML de la tabla
 */
function generarTablaReconocimientosHTML($reconocimientos, $contexto)
{
    $tipo = $contexto['tipo'] ?? 'desconocido';
    $nombre_lista = $contexto['lista'] ?? 'Lista';
    $matricula = $contexto['matricula'] ?? null;

    $cantidad_importada = $contexto['cantidad_importada'] ?? null;

    $titulo = match ($tipo) {
        'nueva_matricula' => "Reconocimientos históricos de {$matricula}",
        'nuevo_destinatario' => "{$nombre_lista}: Reconocimientos históricos",
        'importacion_vehiculos' => "{$nombre_lista}: Reconocimientos históricos, {$cantidad_importada} vehículos importados",
        'importacion_destinatarios' => "Te damos la bienvenida a {$nombre_lista}",
        default => "Reconocimientos históricos"
    };

    $url_base = "https://{$_ENV['ION_SERVER']}" ?? 'http://localhost';

    $html = "
    <div style='margin: 20px 0;'>
        <h3 style='color: #b22e24; margin-bottom: 15px;'>{$titulo}</h3>
        <p style='margin-bottom: 15px;'>Se encontraron " . count($reconocimientos) . " reconocimientos.</p>
        
        <table style='width: 100%; border-collapse: collapse; font-size: 14px;'>
            <thead>
                <tr style='background-color: #f5f5f5;'>
                    <th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Fecha</th>
                    <th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Hora</th>
                    <th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Matrícula</th>
                    <th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Dispositivo</th>
                    <th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Velocidad</th>
                    <th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Imagen</th>
                </tr>
            </thead>
            <tbody>";

    foreach ($reconocimientos as $recon) {
        $fecha = $recon->fecha ?? '-';
        $hora = $recon->hora ?? '-';
        $mat = $recon->matricula ?? '-';
        $dispositivo = $recon->nom_dispositivo ??  '-';
        $velocidad = $recon->velocidad_vehiculo ?? '-';
        if ($velocidad !== '-' && $velocidad !== '') {
            $velocidad .= ' km/h';
        }

        $foto = $recon->foto ?? null;
        $link_imagen = '-';
        if ($foto) {
            $link_imagen = "<a href='{$url_base}/core/fotos/{$foto}' target='_blank' style='color: #b22e24;'>Ver</a>";
        }

        $html .= "
                <tr>
                    <td style='padding: 8px; border: 1px solid #ddd;'>{$fecha}</td>
                    <td style='padding: 8px; border: 1px solid #ddd;'>{$hora}</td>
                    <td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>{$mat}</td>
                    <td style='padding: 8px; border: 1px solid #ddd;'>{$dispositivo}</td>
                    <td style='padding: 8px; border: 1px solid #ddd;'>{$velocidad}</td>
                    <td style='padding: 8px; border: 1px solid #ddd;'>{$link_imagen}</td>
                </tr>";
    }

    $html .= "
            </tbody>
        </table>
    </div>";

    return $html;
}

/**
 * Envía email con tabla de reconocimientos históricos
 * 
 * @param array $reconocimientos Lista de reconocimientos
 * @param object $destinatario Datos del destinatario
 * @param array $contexto Contexto de la notificación
 * @return bool True si se envió correctamente
 */
function enviarNotificacionEmailHistorico($reconocimientos, $destinatario, $contexto)
{
    $tipo = $contexto['tipo'] ?? 'desconocido';
    $nombre_lista = $contexto['lista'] ?? 'Lista';
    $matricula = $contexto['matricula'] ?? null;

    $cantidad_importada = $contexto['cantidad_importada'] ?? null;

    $subject = match ($tipo) {
        'nueva_matricula' => "Reconocimientos históricos: {$matricula} añadida a {$nombre_lista}",
        'nuevo_destinatario' => "Reconocimientos históricos en {$nombre_lista}",
        'importacion_vehiculos' => "Reconocimientos históricos: {$cantidad_importada} vehículos importados a {$nombre_lista}",
        'importacion_destinatarios' => "Te damos la bienvenida a {$nombre_lista} - Reconocimientos históricos",
        default => "Reconocimientos históricos"
    };

    $intro = match ($tipo) {
        'nueva_matricula' => "Se ha añadido la matrícula <strong>{$matricula}</strong> a la lista <strong>{$nombre_lista}</strong>.",
        'nuevo_destinatario' => "Has sido añadido como destinatario de la lista <strong>{$nombre_lista}</strong>.",
        'importacion_vehiculos' => "Se han importado <strong>{$cantidad_importada} vehículos</strong> a la lista <strong>{$nombre_lista}</strong>.",
        'importacion_destinatarios' => "Has sido añadido como destinatario de la lista <strong>{$nombre_lista}</strong> mediante importación masiva.",
        default => "Reconocimientos históricos disponibles."
    };

    $tablaHTML = generarTablaReconocimientosHTML($reconocimientos, $contexto);

    $body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background-color: #b22e24; color: white; padding: 15px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Reconocimientos Históricos</h2>
            </div>
            <div class='content'>
                <p>{$intro}</p>
                <p>A continuación se muestran los reconocimientos detectados:</p>
                {$tablaHTML}
            </div>
            <div class='footer'>
                <p>Este es un mensaje automático del sistema de reconocimiento de matrículas.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    try {
        return enviarCorreo(
            subject: $subject,
            body: $body,
            address: $destinatario->destinatario,
            isHTML: true
        );
    } catch (Exception $e) {
        EscribirLog(
            "Error al enviar email histórico a {$destinatario->destinatario}: {$e->getMessage()}",
            "error"
        );
        return false;
    }
}

/**
 * Simula envío de SMS con resumen histórico
 * 
 * @param array $resumen Resumen de reconocimientos
 * @param object $destinatario Datos del destinatario
 * @param array $contexto Contexto de la notificación
 * @return bool True (simulado)
 */
function enviarNotificacionSMSHistorico($resumen, $destinatario, $contexto)
{
    $tipo = $contexto['tipo'] ?? 'desconocido';
    $nombre_lista = $contexto['lista'] ?? 'Lista';
    $matricula = $contexto['matricula'] ?? null;

    $total = $resumen['total'];
    $fecha_min = $resumen['fecha_min'];
    $fecha_max = $resumen['fecha_max'];

    $cantidad_importada = $contexto['cantidad_importada'] ?? null;

    $mensaje = match ($tipo) {
        'nueva_matricula' => "Matrícula {$matricula} añadida a {$nombre_lista}. {$total} detecciones entre {$fecha_min} y {$fecha_max}.",
        'nuevo_destinatario' => "Añadido a {$nombre_lista}. {$total} reconocimientos históricos disponibles.",
        'importacion_vehiculos' => "{$cantidad_importada} vehículos importados a {$nombre_lista}. {$total} detecciones entre {$fecha_min} y {$fecha_max}.",
        'importacion_destinatarios' => "Te damos la bienvenida a {$nombre_lista}. {$total} reconocimientos históricos disponibles.",
        default => "{$total} reconocimientos históricos."
    };

    EscribirLog(
        "[SMS HISTÓRICO SIMULADO] Enviando a {$destinatario->destinatario}: {$mensaje}"
    );

    return true;
}

/**
 * Simula envío de WhatsApp con resumen histórico
 * 
 * @param array $resumen Resumen de reconocimientos
 * @param object $destinatario Datos del destinatario
 * @param array $contexto Contexto de la notificación
 * @return bool True (simulado)
 */
function enviarNotificacionWhatsappHistorico($resumen, $destinatario, $contexto)
{
    $tipo = $contexto['tipo'] ?? 'desconocido';
    $nombre_lista = $contexto['lista'] ?? 'Lista';
    $matricula = $contexto['matricula'] ?? null;

    $total = $resumen['total'];
    $fecha_min = $resumen['fecha_min'];
    $fecha_max = $resumen['fecha_max'];

    $cantidad_importada = $contexto['cantidad_importada'] ?? null;

    $mensaje = "📊 *Reconocimientos Históricos*\n\n";

    if ($tipo === 'nueva_matricula') {
        $mensaje .= "Matrícula *{$matricula}* añadida a *{$nombre_lista}*\n\n";
    } else if ($tipo === 'importacion_vehiculos') {
        $mensaje .= "*{$cantidad_importada} vehículos* importados a *{$nombre_lista}*\n\n";
    } else if ($tipo === 'importacion_destinatarios') {
        $mensaje .= "🎉 Te damos la bienvenida a *{$nombre_lista}*\n\n";
    } else {
        $mensaje .= "Has sido añadido a la lista *{$nombre_lista}*\n\n";
    }

    $mensaje .= "Total: {$total} detecciones\n";
    $mensaje .= "Período: {$fecha_min} - {$fecha_max}\n\n";

    if (!empty($resumen['matriculas'])) {
        $mensaje .= "Desglose:\n";
        foreach ($resumen['matriculas'] as $mat => $count) {
            $mensaje .= "• {$mat}: {$count} detecciones\n";
        }
    }

    EscribirLog(
        "[WHATSAPP HISTÓRICO SIMULADO] Enviando a {$destinatario->destinatario}: {$mensaje}"
    );

    return true;
}
