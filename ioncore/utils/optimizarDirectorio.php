<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/consts.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/utils/main.php";

/**
 * Entrada JSON (POST):
 * {
 *   "directorio": "ruta/relativa/desde/document_root",
 *   "sufijo": "_opt",                // opcional; si no se pone, puede sobrescribir
 *   "calidad": 75,                   // 0-100 (JPEG); para PNG se mapea a 0-9
 *   "minKB": 300                     // tamaño mínimo en KB (por defecto 300)
 * }
 */

// --- Leer entrada ---
$jsonobj  = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$directorio = $jsonobj2->directorio ?? null;
$sufijo     = $jsonobj2->sufijo     ?? null;
$calidad    = isset($jsonobj2->calidad) ? (int)$jsonobj2->calidad : 20;

// Tamaño mínimo (KB). Preferimos minKB; si viene maxFileSize lo interpretamos en KB para compat.
$minKB = isset($jsonobj2->minKB) ? (int)$jsonobj2->minKB : 300;

if (!$directorio) {
    acabarRequest(["error" => true, "message" => "Falta 'directorio' en el JSON."]);
}

// --- Paths y glob ---
$baseDir = rtrim($_SERVER["DOCUMENT_ROOT"] . '/' . ltrim($directorio, '/'), '/');
$pattern = $baseDir . '/*.{jpg,jpeg,png}';

$imagenes = glob($pattern, GLOB_BRACE);
if (empty($imagenes)) {
    acabarRequest([]); // nada que hacer
}

// --- Filtro por tamaño: solo > minKB ---
$imagenes = array_values(array_filter($imagenes, function($img) use ($minKB) {
    return is_file($img) && filesize($img) > $minKB * 1024;
}));

if (empty($imagenes)) {
    acabarRequest([]); // no hay ninguna que supere el umbral
}

$total = count($imagenes);
if ($total > 2000) {
    acabarRequestSinSalir(["message" => "Proceso comenzado. {$total} imágenes a procesar."]);
}

$returnObj = [];

$sidecarsTouched = []; // sidecars creados/validados esta ejecución
$hadFailure = false;

foreach ($imagenes as $img) {
    $extension = strtolower(pathinfo($img, PATHINFO_EXTENSION));
    $filename  = pathinfo($img, PATHINFO_FILENAME);
    $dirName   = pathinfo($img, PATHINFO_DIRNAME);

    // Calcular salida
    if ($sufijo !== null && $sufijo !== '') {
        $img_opt = sprintf("%s/%s.%s", $dirName, $filename . $sufijo, $extension);
    } else {
        $img_opt = $img; // sobrescribe
    }

    // SIDE-CAR: marca por archivo/quality/sufijo (a prueba de cortes)
    $sidecar = sidecarPath($img, (int)$calidad, $sufijo);

    // Si existe sidecar, opcionalmente validamos que el original no cambió
    if (is_file($sidecar)) {
        $meta = @json_decode(@file_get_contents($sidecar), true);
        if (is_array($meta)) {
            $src_mtime = @filemtime($img);
            if (!empty($meta['src_mtime']) && (int)$meta['src_mtime'] === (int)$src_mtime) {
                // Ya optimizada con esta calidad y no cambió el original → skip
                $returnObj[] = (object)[
                    "original"   => $img,
                    "img_opt"    => $meta['dest'] ?? $img_opt,
                    "optimizado" => false,
                    "skip"       => "sidecar",
                ];
                $sidecarsTouched[] = $sidecar;

                continue;
            }
        }
    }

    // Si hay sufijo y el destino existe y no es más viejo → skip (idempotencia rápida)
    if ($img_opt !== $img && is_file($img_opt) && filemtime($img_opt) >= filemtime($img)) {
        $returnObj[] = (object)[
            "original"   => $img,
            "img_opt"    => $img_opt,
            "optimizado" => false,
            "skip"       => "mtime",
        ];
        // aseguramos sidecar actualizado
        write_sidecar_atomic($sidecar, [
            'src'       => $img,
            'dest'      => $img_opt,
            'src_mtime' => filemtime($img),
            'quality'   => (int)$calidad,
            'ts'        => time(),
        ]);
        $sidecarsTouched[] = $sidecar;
        continue;
    }

    $pre_size_kb = round(filesize($img) / 1024, 1);

    // Optimizar (GD).
    $optimizar = optimizarImagen(
        ruta_original: $img,
        ruta_guardar : $img_opt,
        calidad      : (int)$calidad,
        autoOrient   : true
    );

    // Escribimos sidecar inmediatamente (atómico) si fue OK
    if ($optimizar !== true) {
        $hadFailure = true;
    } else {
        write_sidecar_atomic($sidecar, [
            'src'       => $img,
            'dest'      => $img_opt,
            'src_mtime' => filemtime($img),
            'quality'   => (int)$calidad,
            'ts'        => time(),
        ]);
        $sidecarsTouched[] = $sidecar;
    }

    $post_size_kb = is_file($img_opt) ? round(filesize($img_opt) / 1024, 1) : null;

    $returnObj[] = (object)[
        "original"           => $img,
        "img_opt"            => $img_opt,
        "optimizado"         => $optimizar,
        "size_kb"            => $pre_size_kb,
        "optimized_size_kb"  => $post_size_kb,
    ];
}

// ------------------ limpieza de sidecars ------------------
/**
 * Política: si **no hubo fallos** ($hadFailure === false), damos por “todo óptimo”
 * y eliminamos los sidecars generados/validados en esta ejecución **siempre que**
 * sigan siendo válidos (destino existe y mtime del src no cambió).
 */
if (!$hadFailure && !empty($sidecarsTouched)) {
    foreach ($sidecarsTouched as $sc) {
        $meta = @json_decode(@file_get_contents($sc), true);
        if (!is_array($meta)) continue;

        $src = $meta['src']  ?? null;
        $dst = $meta['dest'] ?? null;
        $src_mtime = $meta['src_mtime'] ?? null;

        if ($src && $dst && is_file($dst) && is_file($src)
            && (int)@filemtime($src) === (int)$src_mtime) {
            @unlink($sc); // limpieza segura
        }
    }
}

// Si hay muchísima salida, corta con true 
if (count($returnObj) > 2000) {
    acabarRequest(true);
}

acabarRequest($returnObj);
