<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/reconocimientos/main.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/utils/notificaciones.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/utils/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_lista = $jsonobj2->cod_lista ?? null;
$matricula = $jsonobj2->matricula ?? null;
$descripcion_vehiculo = $jsonobj2->descripcion_vehiculo ?? null;

$insert = insertarVehiculosListas(
    cod_lista: $cod_lista,
    matricula: $matricula,
    descripcion_vehiculo: $descripcion_vehiculo,
);

// Responder inmediatamente al cliente (sin exit para permitir post-procesamiento)
acabarRequestSinSalir($insert);

// Procesar notificaciones históricas post-respuesta (solo para listas negras)
if ($insert && !isset($insert['error']) && $matricula && $cod_lista) {
    ejecutarPostRespuesta(function () use ($matricula, $cod_lista) {
        try {
            // Obtener información de la lista
            $lista = obtenerListasParam(cod_lista: $cod_lista);
            if (empty($lista) || isset($lista['error'])) {
                EscribirLog("No se encontró la lista {$cod_lista} para notificaciones históricas", "error");
                return;
            }

            $desc_lista = $lista[0]->desc_lista ?? null;
            $nombre_lista = $lista[0]->nombre_lista ?? "Lista {$cod_lista}";

            // Solo enviar notificaciones históricas para listas negras
            if ($desc_lista !== 'n') {
                EscribirLog(
                    "Lista {$nombre_lista} es de tipo '{$desc_lista}' (no negra). " .
                        "No se envían notificaciones históricas.",
                    "info"
                );
                return;
            }

            // Obtener destinatarios activos de la lista
            $destinatarios = obtenerDestinatariosLista(
                cod_lista: $cod_lista,
                soloActivos: true
            );

            if (empty($destinatarios) || isset($destinatarios['error'])) {
                EscribirLog("No hay destinatarios activos en la lista {$cod_lista} para notificar");
                return;
            }

            // Buscar reconocimientos históricos de la matrícula (últimos 30 días)
            $reconocimientos = obtenerReconocimientosMatriculaHistorico(
                matricula: $matricula,
            );

            if (empty($reconocimientos) || isset($reconocimientos['error'])) {
                EscribirLog("No se encontraron reconocimientos históricos de {$matricula}");
                return;
            }

            // Preparar contexto
            $contexto = [
                'tipo' => 'nueva_matricula',
                'lista' => $nombre_lista,
                'matricula' => $matricula
            ];

            // Enviar notificaciones
            EscribirLog(
                "Enviando notificaciones históricas: {$matricula} añadida a lista negra {$nombre_lista}. " .
                    count($reconocimientos) . " reconocimientos a " . count($destinatarios) . " destinatarios."
            );

            $resultados = enviarNotificacionHistorica($destinatarios, $reconocimientos, $contexto);

            $exitosos = array_filter($resultados, fn($r) => $r['exito']);
            EscribirLog(
                "Notificaciones históricas completadas: " . count($exitosos) . "/" . count($resultados) . " exitosas"
            );
        } catch (Exception $e) {
            EscribirLog(
                "Error al procesar notificaciones históricas para {$matricula}: {$e->getMessage()}",
                "error"
            );
        }
    });
}
