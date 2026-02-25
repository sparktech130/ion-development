<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/reconocimientos/main.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/utils/notificaciones.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/utils/main.php";

if (!(isset($_FILES['archivo_csv']) && $_FILES['archivo_csv']['error'] === UPLOAD_ERR_OK)) {
    acabarRequest(["message" => "Archivo csv no recibido", "error" => true]);
}

$cod_lista = $_POST["cod_lista"] ?? null;
$archivo_csv = fopen($_FILES['archivo_csv']['tmp_name'], 'r');

$resultado = importarVehiculosLista(
    archivo_csv: $archivo_csv,
    cod_lista: $cod_lista,
);

// Responder inmediatamente al cliente (sin exit para permitir post-procesamiento)
acabarRequestSinSalir($resultado);

// Procesar notificaciones históricas post-respuesta para vehículos importados (solo listas negras)
if ($resultado && !isset($resultado['error']) && !empty($resultado['insert']) && $cod_lista) {
    ejecutarPostRespuesta(function () use ($resultado, $cod_lista) {
        try {
            $matriculas_importadas = $resultado['insert'];

            if (empty($matriculas_importadas)) {
                EscribirLog("No se importaron vehículos exitosamente en la lista {$cod_lista}");
                return;
            }

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
                        "No se envían notificaciones históricas para la importación.",
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
                EscribirLog("No hay destinatarios activos en la lista {$cod_lista} para notificar importación");
                return;
            }

            EscribirLog(
                "Procesando notificaciones históricas para " . count($matriculas_importadas) .
                    " vehículos importados en lista negra {$nombre_lista}"
            );

            // Buscar reconocimientos históricos de cada matrícula importada
            $reconocimientos_totales = [];
            foreach ($matriculas_importadas as $matricula) {
                $recons = obtenerReconocimientosMatriculaHistorico(
                    matricula: $matricula,
                );

                if (!empty($recons) && !isset($recons['error'])) {
                    $reconocimientos_totales = array_merge($reconocimientos_totales, $recons);
                }
            }

            if (empty($reconocimientos_totales)) {
                EscribirLog("No se encontraron reconocimientos históricos para los vehículos importados");
                return;
            }

            // Preparar contexto
            $contexto = [
                'tipo' => 'importacion_vehiculos',
                'lista' => $nombre_lista,
                'matricula' => null,
                'cantidad_importada' => count($matriculas_importadas)
            ];

            // Enviar notificaciones
            EscribirLog(
                "Enviando notificaciones históricas: " . count($matriculas_importadas) .
                    " vehículos importados en lista negra {$nombre_lista}. " .
                    count($reconocimientos_totales) . " reconocimientos a " . count($destinatarios) . " destinatarios."
            );

            $resultados = enviarNotificacionHistorica($destinatarios, $reconocimientos_totales, $contexto);

            $exitosos = array_filter($resultados, fn($r) => $r['exito']);
            EscribirLog(
                "Notificaciones históricas de importación completadas: " . count($exitosos) . "/" . count($resultados) . " exitosas"
            );
        } catch (Exception $e) {
            EscribirLog(
                "Error al procesar notificaciones históricas para importación: {$e->getMessage()}",
                "error"
            );
        }
    });
}
