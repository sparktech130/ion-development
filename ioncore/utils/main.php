<?php
function sidecarPath(string $src, int $quality, ?string $sufijo): string
{
    // Archivo acompañante por imagen, que marca que ya se optimizó esa combinación
    $suf = $sufijo ?? 'no_suf';
    return $src . ".opt-{$suf}-q{$quality}.done";
}

function write_sidecar_atomic(string $sidecar, array $data): bool
{
    $tmp = $sidecar . '.tmp_' . uniqid('', true);
    $json = json_encode($data, JSON_UNESCAPED_SLASHES);
    if (file_put_contents($tmp, $json, LOCK_EX) === false) return false;
    return rename($tmp, $sidecar); // atómico en el mismo FS
}

/**
 * Optimiza una imagen con GD, manejando EXIF y sobrescritura segura.
 * - JPEG: calidad 0–100, progresivo, corrige orientación EXIF si existe.
 * - PNG : mapea calidad 0–100 a nivel 0–9.
 * - Si $ruta_guardar === $ruta_original → escribe a temporal y renombra.
 */
function optimizarImagen(
    string $ruta_original,
    string $ruta_guardar,
    int $calidad = 50,
    bool $autoOrient = true
) {
    $ext = strtolower(pathinfo($ruta_original, PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png'])) {
        return ["error" => true, "message" => "Extensión de fichero inválida"];
    }

    $mismoArchivo = ($ruta_original === $ruta_guardar);
    $destino = $mismoArchivo ? ($ruta_guardar . '.tmp_' . uniqid('', true)) : $ruta_guardar;

    try {
        if ($ext === 'jpg' || $ext === 'jpeg') {
            $img = @imagecreatefromjpeg($ruta_original);
            if (!$img) return false;

            if ($autoOrient && function_exists('exif_read_data')) {
                $exif = @exif_read_data($ruta_original);
                if (!empty($exif['Orientation'])) {
                    switch ((int)$exif['Orientation']) {
                        case 3:
                            $img = imagerotate($img, 180, 0);
                            break;
                        case 6:
                            $img = imagerotate($img, -90, 0);
                            break;
                        case 8:
                            $img = imagerotate($img, 90, 0);
                            break;
                    }
                }
            }

            if (function_exists('imageinterlace')) {
                imageinterlace($img, true); // JPEG progresivo
            }

            $q = max(0, min(100, (int)$calidad));
            $ok = imagejpeg($img, $destino, $q);
            imagedestroy($img);

            if ($ok && $mismoArchivo) {
                $ok = rename($destino, $ruta_guardar);
            }

            return $ok;
        } elseif ($ext === 'png') {
            $img = @imagecreatefrompng($ruta_original);
            if (!$img) return false;

            // Mantener canal alfa
            imagesavealpha($img, true);

            // Mapear 0–100 → 0–9 (menor nivel = menos compresión = más calidad percibida)
            $q = max(0, min(100, (int)$calidad));
            $nivel = (int) round((100 - $q) * 9 / 100);

            $ok = imagepng($img, $destino, $nivel);
            imagedestroy($img);

            if ($ok && $mismoArchivo) {
                $ok = rename($destino, $ruta_guardar);
            }

            return $ok;
        }
    } catch (Throwable $e) {
        return ["error" => true, "message" => "Error al optimizar imagen: {$e->getMessage()}"];
    }

    return false;
}

/**
 * Ejecuta un callback después de enviar la respuesta HTTP al cliente
 * Permite procesar tareas pesadas sin bloquear la respuesta de la API
 * 
 * @param callable $callback Función a ejecutar post-respuesta
 * @return void
 */
function ejecutarPostRespuesta($callback)
{
    // Cerrar la conexión con el cliente
    if (function_exists('fastcgi_finish_request')) {
        // Para PHP-FPM
        fastcgi_finish_request();
    } else {
        // Fallback para otros servidores
        ignore_user_abort(true);
        set_time_limit(0);

        // Forzar envío del buffer
        if (ob_get_level() > 0) {
            ob_end_flush();
        }
        flush();
    }

    // Ejecutar el callback después de cerrar la conexión
    try {
        if (is_callable($callback)) {
            $callback();
        }
    } catch (Exception $e) {
        EscribirLog(
            "Error en ejecución post-respuesta: {$e->getMessage()}",
            "error"
        );
    } catch (Throwable $e) {
        EscribirLog(
            "Error crítico en ejecución post-respuesta: {$e->getMessage()}",
            "error"
        );
    }
}

function verifyDate($date, $format = "Y-m-d H:i:s")
{
    return (DateTime::createFromFormat($format, $date) !== false);
}
