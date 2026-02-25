<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/reconocimientos_personas/main.php";

function procesarFotosReconocimientosPersonas($fecha_ini, $fecha_fin)
{
    $reconocimientos = obtenerReconocimientosPersonas(
        fecha_ini: $fecha_ini,
        fecha_fin: $fecha_fin,
        limit: 20000,
    );
    $procesados = 0;
    $errores = 0;
    $fixes = 0;
    $erroresFix = 0;
    $noB64 = 0;

    foreach ($reconocimientos as $reconocimiento) {
        if (!empty($reconocimiento->foto) && esBase64($reconocimiento->foto)) {
            $timestamp = strtotime($reconocimiento->fecha_hora);
            $deviceId = $reconocimiento->deviceId ?? 'unknown';
            $nombreArchivo = $timestamp . '_' . $reconocimiento->refTrackingId . '_' . $deviceId . '.jpg';
            $rutaInsert = "personas/{$nombreArchivo}";
            $rutaCompleta = $_SERVER["DOCUMENT_ROOT"] . "/core/fotos/{$rutaInsert}";

            $Base64Img = base64_decode($reconocimiento->foto);
            $saved = file_put_contents($rutaCompleta, $Base64Img);
            if ($saved !== false) {
                $procesados++;
                $update = modificarReconocimientosPersonas(
                    refTrackingId: $reconocimiento->refTrackingId,
                    foto: $rutaInsert,
                );
                if ($update === true) {
                    $fixes++;
                } else {
                    $erroresFix++;
                }
            } else {
                $errores++;
            }
        } else {
            $noB64++;
        }
    }

    return [
        'total' => count($reconocimientos),
        'procesados' => $procesados,
        'fixes' => $fixes,
        'erroresFix' => $erroresFix,
        'errores' => $errores,
        'noB64' => $noB64,
    ];
}

function esBase64($cadena)
{
    if (empty($cadena)) {
        return false;
    }

    if (strpos($cadena, 'data:image/') === 0) {
        return true;
    }

    if (base64_decode($cadena, true) !== false && base64_encode(base64_decode($cadena)) === $cadena) {
        return true;
    }

    return false;
}

function guardarImagenBase64N($base64, $rutaDestino)
{
    try {
        if (strpos($base64, 'data:image/') === 0) {
            $partes = explode(',', $base64);
            $base64 = end($partes);
        }

        $imagenDecodificada = base64_decode($base64);
        if ($imagenDecodificada === false) {
            return false;
        }

        $directorio = dirname($rutaDestino);
        if (!is_dir($directorio)) {
            mkdir($directorio, 0755, true);
        }

        $put = file_put_contents($rutaDestino, $imagenDecodificada);
        return $put !== false;
    } catch (Exception $e) {
        echo $e->getMessage();
        return false;
    }
}
