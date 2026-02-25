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

$resultado = importarDestinatariosLista(
    archivo_csv: $archivo_csv,
    cod_lista: $cod_lista,
);

// Responder inmediatamente al cliente (sin exit para permitir post-procesamiento)
acabarRequestSinSalir($resultado);

// Procesar notificaciones históricas post-respuesta para destinatarios importados exitosamente
if ($resultado && !isset($resultado['error']) && !empty($resultado['insert']) && $cod_lista) {
    ejecutarPostRespuesta(function () use ($resultado, $cod_lista) {
        try {
            $destinatarios_importados = $resultado['insert'];

            if (empty($destinatarios_importados)) {
                EscribirLog("No se importaron destinatarios exitosamente en la lista {$cod_lista}");
                return;
            }

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
                EscribirLog("No hay vehículos en la lista {$cod_lista} para notificar a destinatarios importados");
                return;
            }

            EscribirLog(
                "Procesando notificaciones históricas para " . count($destinatarios_importados) .
                    " destinatarios importados en {$nombre_lista}"
            );

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

            // Obtener los destinatarios importados completos para enviar notificaciones
            $destinatarios_obj = obtenerDestinatariosLista(
                cod_lista: $cod_lista,
                soloActivos: true
            );

            // Filtrar solo los destinatarios recién importados
            $destinatarios_nuevos = array_filter(
                $destinatarios_obj,
                fn($d) => in_array($d->destinatario, $destinatarios_importados)
            );

            if (empty($destinatarios_nuevos)) {
                EscribirLog("No se encontraron destinatarios activos recién importados");
                return;
            }

            // Preparar contexto
            $contexto = [
                'tipo' => 'importacion_destinatarios',
                'lista' => $nombre_lista,
                'matricula' => null,
                'cantidad_importada' => count($destinatarios_importados)
            ];

            // Enviar notificaciones
            EscribirLog(
                "Enviando notificaciones históricas: " . count($destinatarios_nuevos) .
                    " destinatarios importados en {$nombre_lista}. " .
                    count($reconocimientos_totales) . " reconocimientos de " . count($vehiculos) . " vehículos."
            );

            $resultados = enviarNotificacionHistorica($destinatarios_nuevos, $reconocimientos_totales, $contexto);

            $exitosos = array_filter($resultados, fn($r) => $r['exito']);
            EscribirLog(
                "Notificaciones históricas de importación de destinatarios completadas: " .
                    count($exitosos) . "/" . count($resultados) . " exitosas"
            );
        } catch (Exception $e) {
            EscribirLog(
                "Error al procesar notificaciones históricas para importación de destinatarios: {$e->getMessage()}",
                "error"
            );
        }
    });
}
