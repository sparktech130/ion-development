<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/reconocimientos/main.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/utils/notificaciones.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/utils/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_lista = $jsonobj2->cod_lista ?? null;
$canal = $jsonobj2->canal ?? 'email';
$destinatario = $jsonobj2->destinatario ?? null;
$nombre = $jsonobj2->nombre ?? null;

// Validar canal
if (!in_array($canal, ['email', 'sms', 'whatsapp'])) {
    acabarRequest([
        "error" => true,
        "message" => "Canal inválido. Debe ser: email, sms o whatsapp"
    ], 400);
}

// Validar campos requeridos
if (!$cod_lista || !$destinatario) {
    acabarRequest([
        "error" => true,
        "message" => "Faltan campos requeridos: cod_lista y destinatario"
    ], 400);
}

$insert = insertarDestinatarioLista(
    cod_lista: $cod_lista,
    canal: $canal,
    destinatario: $destinatario,
    nombre: $nombre,
);

// Responder inmediatamente al cliente (sin exit para permitir post-procesamiento)
if ($insert && !isset($insert['error'])) {
    acabarRequestSinSalir(["id" => $insert]);
} else {
    acabarRequestSinSalir($insert);
}

// Procesar notificaciones históricas post-respuesta
if ($insert && !isset($insert['error']) && $cod_lista) {
    ejecutarPostRespuesta(function () use ($cod_lista, $destinatario, $canal, $nombre, $insert) {
        try {
            // Obtener información de la lista
            $lista = obtenerListasParam(cod_lista: $cod_lista);
            if (empty($lista) || isset($lista['error'])) {
                EscribirLog("No se encontró la lista {$cod_lista} para notificaciones históricas", "error");
                return;
            }
            $nombre_lista = $lista[0]->nombre_lista ?? "Lista {$cod_lista}";

            // Obtener vehículos de la lista
            $vehiculos = obtenerVehiculosListas(cod_lista: $cod_lista);

            if (empty($vehiculos) || isset($vehiculos['error'])) {
                EscribirLog("No hay vehículos en la lista {$cod_lista} para notificar");
                return;
            }

            // Buscar reconocimientos históricos de cada matrícula
            $reconocimientos_totales = [];
            foreach ($vehiculos as $vehiculo) {
                $matricula = $vehiculo->matricula ?? null;
                if (!$matricula) continue;

                $recons = obtenerReconocimientosMatriculaHistorico(
                    matricula: $matricula,
                );

                if (!empty($recons) && !isset($recons['error'])) {
                    $reconocimientos_totales = array_merge($reconocimientos_totales, $recons);
                }
            }

            if (empty($reconocimientos_totales)) {
                EscribirLog("No se encontraron reconocimientos históricos para vehículos de la lista {$cod_lista}");
                return;
            }

            // Crear objeto destinatario para el helper
            $dest_obj = (object)[
                'id' => $insert,
                'cod_lista' => $cod_lista,
                'nombre' => $nombre,
                'canal' => $canal,
                'destinatario' => $destinatario,
                'nombre_lista' => $nombre_lista
            ];

            // Preparar contexto
            $contexto = [
                'tipo' => 'nuevo_destinatario',
                'lista' => $nombre_lista,
                'matricula' => null
            ];

            // Enviar notificaciones
            EscribirLog(
                "Enviando notificaciones históricas: nuevo destinatario en {$nombre_lista}. " .
                    count($reconocimientos_totales) . " reconocimientos de " . count($vehiculos) . " vehículos."
            );

            $resultados = enviarNotificacionHistorica([$dest_obj], $reconocimientos_totales, $contexto);

            if (!empty($resultados) && $resultados[0]['exito']) {
                EscribirLog("Notificación histórica enviada exitosamente al nuevo destinatario");
            } else {
                EscribirLog("Error al enviar notificación histórica al nuevo destinatario", "error");
            }
        } catch (Exception $e) {
            EscribirLog(
                "Error al procesar notificaciones históricas para nuevo destinatario: {$e->getMessage()}",
                "error"
            );
        }
    });
}
