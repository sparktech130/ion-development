<?php

declare(strict_types=1);

if (!defined("AEMET_BASE")) {
    define("AEMET_BASE", "https://opendata.aemet.es/opendata");
}

if (!defined("AEMET_API_KEY")) {
    define("AEMET_API_KEY", $_ENV["AEMET_API_KEY"] ?? null);
}

/* =========================================================
   UTILIDADES
   ========================================================= */

function sanitize_error_message(string $msg): string
{
    return preg_replace('/api_key=([^&\s]+)/i', 'api_key=***', $msg);
}

function http_get(string $url, int $timeout = 60): array
{
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER         => true,   // para capturar headers + body
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_USERAGENT      => 'PHP-AEMET',
        CURLOPT_HTTPHEADER     => ['Accept: */*'],
        CURLOPT_FOLLOWLOCATION => true,
        // En producción lo ideal es true. Si tu hosting no tiene CA bundle, prueba false temporalmente.
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);

    $raw = curl_exec($ch);
    if ($raw === false) {
        $err = curl_error($ch);
        throw new RuntimeException("cURL error en $url: $err");
    }

    $status     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);

    $headerText = substr($raw, 0, $headerSize);
    $body       = substr($raw, $headerSize);

    // Normaliza headers a array de líneas tipo $http_response_header
    $headers = preg_split("/\r\n|\n|\r/", trim($headerText));

    return ['status' => (int)$status, 'body' => $body, 'headers' => $headers];
}

function aemet_call_api(string $path): array
{
    if (empty(AEMET_API_KEY)) {
        throw new RuntimeException('Configura AEMET_API_KEY');
    }

    $url = AEMET_BASE . '/' . ltrim($path, '/') . '?api_key=' . urlencode(AEMET_API_KEY);
    $r = http_get($url, 40);

    if ($r['status'] !== 200) {
        throw new RuntimeException("AEMET HTTP {$r['status']} en $url: {$r['body']}");
    }

    $json = json_decode($r['body'], true);
    if (!is_array($json)) {
        throw new RuntimeException('Respuesta AEMET no es JSON (primer paso)');
    }

    return $json;
}

function headers_content_type(array $headers): string
{
    foreach ($headers as $h) {
        if (stripos($h, 'Content-Type:') === 0) {
            return trim(substr($h, 13));
        }
    }
    return '';
}

/**
 * Descarga 2º paso y devuelve typed:
 * - json => ['mode'=>'json','json'=>...]
 * - text => ['mode'=>'text','text'=>...]
 * - binary => ['mode'=>'binary','mime'=>...,'bytes'=>...]
 */
function aemet_download_datos_typed(string $url): array
{
    $r = http_get($url, 90);
    if ($r['status'] < 200 || $r['status'] >= 300) {
        throw new RuntimeException("AEMET datos HTTP {$r['status']} en $url");
    }

    $body = $r['body'];
    $mime = headers_content_type($r['headers']);

    // 1) JSON directo
    $json = json_decode($body, true);
    if (is_array($json)) {
        return ['mode' => 'json', 'mime' => $mime ?: 'application/json', 'json' => $json];
    }

    // 2) JSON incrustado como texto (recorte desde { o [) + fix encoding
    $trim = ltrim($body);
    $pos1 = strpos($trim, '{');
    $pos2 = strpos($trim, '[');
    $pos = ($pos1 !== false && $pos2 !== false) ? min($pos1, $pos2) : ($pos1 !== false ? $pos1 : $pos2);

    if ($pos !== false) {
        $candidate = substr($trim, $pos);

        $json2 = json_decode($candidate, true);
        if (is_array($json2)) {
            return ['mode' => 'json', 'mime' => $mime ?: 'application/json', 'json' => $json2];
        }

        if (function_exists('mb_convert_encoding')) {
            $utf8 = mb_convert_encoding($candidate, 'UTF-8', 'ISO-8859-1');
            $json3 = json_decode($utf8, true);
            if (is_array($json3)) {
                return ['mode' => 'json', 'mime' => $mime ?: 'application/json', 'json' => $json3];
            }
        }
    }

    // 3) detectar binario por firma
    if (str_starts_with($body, "GIF87a") || str_starts_with($body, "GIF89a")) {
        return ['mode' => 'binary', 'mime' => $mime ?: 'image/gif', 'bytes' => $body];
    }
    if (substr($body, 0, 8) === "\x89PNG\r\n\x1a\n") {
        return ['mode' => 'binary', 'mime' => $mime ?: 'image/png', 'bytes' => $body];
    }
    if (substr($body, 0, 4) === "%PDF") {
        return ['mode' => 'binary', 'mime' => $mime ?: 'application/pdf', 'bytes' => $body];
    }
    if (substr($body, 0, 2) === "PK") {
        return ['mode' => 'binary', 'mime' => $mime ?: 'application/zip', 'bytes' => $body];
    }

    // 4) texto
    return ['mode' => 'text', 'mime' => $mime ?: 'text/plain', 'text' => $body];
}

/* =========================================================
   CSV -> ARRAY (para radiación)
   ========================================================= */

function csv_to_rows(string $csv): array
{
    $lines = preg_split("/\r\n|\n|\r/", trim($csv));
    $rows = [];
    foreach ($lines as $line) {
        if (trim($line) === '') continue;
        $rows[] = str_getcsv($line, ';', '"');
    }
    return $rows;
}

/**
 * Convierte fecha "05-02-26" a "2026-02-05" (si puede)
 */
function ddmmyy_to_iso(?string $s): ?string
{
    if (!$s) return null;
    $s = trim(str_replace('"', '', $s));
    if (!preg_match('/^\d{2}-\d{2}-\d{2}$/', $s)) return $s;
    [$dd, $mm, $yy] = explode('-', $s);
    $yyyy = (int)$yy;
    $yyyy = ($yyyy < 70) ? (2000 + $yyyy) : (1900 + $yyyy);
    return sprintf('%04d-%02d-%02d', $yyyy, (int)$mm, (int)$dd);
}

/**
 * Parse radiación CSV a JSON compacto.
 * - Si $stationFilter no es null -> devuelve solo esa estación (por indicativo exacto).
 */
function redes_radiacion_compact(string $csv, ?string $stationFilter = null): array
{
    $rows = csv_to_rows($csv);
    if (count($rows) < 4) {
        return ['fecha' => null, 'producto' => null, 'estaciones' => []];
    }

    $producto = isset($rows[0][0]) ? trim(str_replace('"', '', $rows[0][0])) : null;
    $fechaRaw = isset($rows[1][0]) ? trim(str_replace('"', '', $rows[1][0])) : null;
    $fecha = ddmmyy_to_iso($fechaRaw);

    // La fila 2 suele ser el header largo con horas / SUMA / etc.
    $header = $rows[2];

    // Construimos mapa de columnas "horas" hasta llegar a "SUMA"
    $hourCols = [];
    for ($c = 3; $c < count($header); $c++) {
        $h = trim((string)$header[$c], "\" \t");
        if ($h === '') continue;
        if (strtoupper($h) === 'SUMA') {
            // SUMA suele ser el último campo de cada bloque, pero en algunas tablas se repite.
            // aquí solo lo usamos como "tope" para el primer bloque; igualmente en filas se repite
            // pero nosotros parseamos hasta el final-1 para horas y final para suma.
            // Dejamos de construir horas si llegamos a SUMA en el header.
            break;
        }
        $hourCols[] = $h;
    }

    $stations = []; // por indicativo

    for ($i = 3; $i < count($rows); $i++) {
        $r = $rows[$i];
        if (count($r) < 5) continue;

        $nombre = (string)($r[0] ?? '');
        $indicativo = (string)($r[1] ?? '');
        $tipo = (string)($r[2] ?? '');

        $nombre = trim(str_replace('"', '', $nombre));
        $indicativo = trim(str_replace('"', '', $indicativo));
        $tipo = trim(str_replace('"', '', $tipo));

        if ($indicativo === '' || $tipo === '') continue;

        if ($stationFilter !== null && $stationFilter !== '' && strcasecmp($indicativo, $stationFilter) !== 0) {
            continue;
        }

        if (!isset($stations[$indicativo])) {
            $stations[$indicativo] = [
                'nombre' => $nombre,
                'indicativo' => $indicativo,
                'series' => []
            ];
        }

        // horas: desde col 3 hasta (n-2); último campo suele ser SUMA
        $horas = [];
        $maxCol = count($r) - 1; // último = suma (normalmente)
        for ($c = 3; $c < $maxCol; $c++) {
            $h = $hourCols[$c - 3] ?? null; // si el header no cuadra, igualmente intentamos
            if ($h === null || $h === '') continue;

            $val = $r[$c] ?? '';
            $val = trim((string)$val);
            if ($val === '' || $val === '""') continue;

            // numérico o null
            $horas[$h] = is_numeric($val) ? (float)$val : null;
        }

        $sumaRaw = $r[$maxCol] ?? '';
        $sumaRaw = trim((string)$sumaRaw);
        $suma = is_numeric($sumaRaw) ? (float)$sumaRaw : null;

        $stations[$indicativo]['series'][$tipo] = [
            'horas' => $horas,
            'suma' => $suma
        ];

        // si estamos filtrando por estación y ya la encontramos, seguimos para capturar
        // todas sus series (GL/DF/DT/UVB/IR...) en el resto de filas.
    }

    return [
        'fecha' => $fecha,
        'producto' => $producto,
        'estaciones' => array_values($stations),
    ];
}

/* =========================================================
   PREDICCIÓN HORARIA: OPTIMIZADOR (modo=compact)
   ========================================================= */

function idx_by_periodo(array $arr): array
{
    $out = [];
    foreach ($arr as $it) {
        if (is_array($it) && isset($it['periodo'])) {
            $out[(string)$it['periodo']] = $it;
        }
    }
    return $out;
}

function first_dir_vel(array $it): array
{
    $dir = $it['direccion'][0] ?? null;
    $vel = isset($it['velocidad'][0]) ? (int)$it['velocidad'][0] : null;
    return [$dir, $vel];
}

function prediccion_horaria_compact(array $payload): array
{
    $root = $payload[0] ?? $payload;
    $dia = $root['prediccion']['dia'][0] ?? [];

    $estado = idx_by_periodo($dia['estadoCielo'] ?? []);
    $temp   = idx_by_periodo($dia['temperatura'] ?? []);
    $sens   = idx_by_periodo($dia['sensTermica'] ?? []);
    $hum    = idx_by_periodo($dia['humedadRelativa'] ?? []);
    $prec   = idx_by_periodo($dia['precipitacion'] ?? []);

    $windRaw = $dia['vientoAndRachaMax'] ?? [];
    $wind = [];
    $racha = [];
    foreach ($windRaw as $it) {
        if (!is_array($it) || !isset($it['periodo'])) continue;
        $p = (string)$it['periodo'];
        if (isset($it['value'])) $racha[$p] = (int)$it['value'];
        else $wind[$p] = $it;
    }

    $horas = array_keys($estado);
    sort($horas, SORT_STRING);

    $out = [];
    foreach ($horas as $h) {
        [$dir, $vel] = first_dir_vel($wind[$h] ?? []);
        $out[] = [
            'hora' => $h,
            'cielo' => [
                'codigo' => $estado[$h]['value'] ?? null,
                'desc' => $estado[$h]['descripcion'] ?? null
            ],
            'temp' => isset($temp[$h]['value']) ? (int)$temp[$h]['value'] : null,
            'sens' => isset($sens[$h]['value']) ? (int)$sens[$h]['value'] : null,
            'hum' => isset($hum[$h]['value']) ? (int)$hum[$h]['value'] : null,
            'prec_mm' => isset($prec[$h]['value']) ? (float)$prec[$h]['value'] : null,
            'viento_dir' => $dir,
            'viento_kmh' => $vel,
            'racha_kmh' => $racha[$h] ?? null
        ];
    }

    return [
        'municipio' => $root['nombre'] ?? null,
        'provincia' => $root['provincia'] ?? null,
        'elaborado' => $root['elaborado'] ?? null,
        'enlace' => $root['origen']['enlace'] ?? null,
        'horas' => $out
    ];
}

function aemet_prediccion_municipio_horaria(string $idMunicipio, string $modo = 'raw'): array
{
    if (!preg_match('/^\d{5}$/', $idMunicipio)) {
        throw new InvalidArgumentException('idMunicipio inválido (5 dígitos)');
    }

    $meta = aemet_call_api("/api/prediccion/especifica/municipio/horaria/$idMunicipio");
    if (empty($meta['datos'])) throw new RuntimeException('Predicción: sin campo datos');

    $typed = aemet_download_datos_typed($meta['datos']);
    if ($typed['mode'] !== 'json') {
        return [
            'ok' => true,
            'tipo' => 'prediccion_municipio_horaria',
            'req' => ['idMunicipio' => $idMunicipio, 'modo' => $modo],
            'meta' => $meta,
            'data' => $typed
        ];
    }

    $data = ($modo === 'compact') ? prediccion_horaria_compact($typed['json']) : $typed['json'];

    return [
        'ok' => true,
        'tipo' => 'prediccion_municipio_horaria',
        'req' => ['idMunicipio' => $idMunicipio, 'modo' => $modo],
        'meta' => $meta,
        'data' => $data
    ];
}

/* =========================================================
   AVISOS CAP: MULTI ALERTA + ORDEN POR NIVEL
   ========================================================= */

function cap_polygon_to_coords(string $polygon): array
{
    $polygon = trim($polygon);
    if ($polygon === '') return [];
    $pairs = preg_split('/\s+/', $polygon);
    $coords = [];
    foreach ($pairs as $pair) {
        $parts = explode(',', $pair);
        if (count($parts) === 2) {
            $coords[] = [(float)$parts[0], (float)$parts[1]];
        }
    }
    return $coords;
}

function cap_level_rank(string $level): int
{
    $l = strtolower(trim($level));
    return match ($l) {
        'rojo' => 3,
        'naranja' => 2,
        'amarillo' => 1,
        default => 0
    };
}

/** extrae TODOS los <alert>...</alert> */
function cap_extract_alert_xml_list(string $rawOrText): array
{
    $s = str_replace("\0", "", $rawOrText);

    if (!preg_match_all('/<alert\b.*?<\/alert>/is', $s, $m)) {
        $pos = strpos($s, '<?xml');
        if ($pos !== false) {
            $s2 = substr($s, $pos);
            if (!preg_match_all('/<alert\b.*?<\/alert>/is', $s2, $m)) {
                throw new RuntimeException('CAP: no se encontraron bloques <alert>');
            }
        } else {
            throw new RuntimeException('CAP: no se encontró <?xml ni <alert>');
        }
    }

    $out = [];
    foreach ($m[0] as $block) {
        $block = trim($block);
        $out[] = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . $block;
    }
    return $out;
}

function cap_xml_to_alert(string $xml): array
{
    libxml_use_internal_errors(true);

    $dom = new DOMDocument();
    $ok = $dom->loadXML($xml, LIBXML_NONET);
    libxml_clear_errors();
    if (!$ok) throw new RuntimeException('CAP inválido: no se pudo parsear XML');

    $sx = simplexml_import_dom($dom);
    if ($sx === false) throw new RuntimeException('CAP inválido: error SimpleXML');

    $sx->registerXPathNamespace('cap', 'urn:oasis:names:tc:emergency:cap:1.2');

    $identifier = (string)($sx->xpath('//cap:identifier')[0] ?? '');
    $sent       = (string)($sx->xpath('//cap:sent')[0] ?? '');
    $status     = (string)($sx->xpath('//cap:status')[0] ?? '');

    $infoEs = $sx->xpath('//cap:info[cap:language="es-ES"]');
    $info = $infoEs[0] ?? ($sx->xpath('//cap:info')[0] ?? null);

    $event = $headline = $description = $instruction = $web = '';
    $effective = $onset = $expires = '';
    $level = $prob = $param = '';
    $areaDesc = $polygonRaw = $zoneCode = '';

    if ($info) {
        $event = (string)$info->event;
        $headline = (string)$info->headline;
        $description = (string)$info->description;
        $instruction = (string)$info->instruction;
        $web = (string)$info->web;

        $effective = (string)$info->effective;
        $onset = (string)$info->onset;
        $expires = (string)$info->expires;

        foreach ($info->parameter as $p) {
            $vn = (string)$p->valueName;
            $val = (string)$p->value;
            if ($vn === 'AEMET-Meteoalerta nivel') $level = $val;
            if ($vn === 'AEMET-Meteoalerta probabilidad') $prob = $val;
            if ($vn === 'AEMET-Meteoalerta parametro') $param = $val;
        }

        if (isset($info->area)) {
            $areaDesc = (string)$info->area->areaDesc;
            $polygonRaw = (string)$info->area->polygon;
            foreach ($info->area->geocode as $g) {
                if ((string)$g->valueName === 'AEMET-Meteoalerta zona') {
                    $zoneCode = (string)$g->value;
                }
            }
        }
    }

    $rank = cap_level_rank($level);

    return [
        'identifier' => $identifier,
        'sent' => $sent,
        'status' => $status,
        'event' => $event,
        'headline' => $headline,
        'description' => $description,
        'instruction' => $instruction,
        'web' => $web,
        'effective' => $effective,
        'onset' => $onset,
        'expires' => $expires,
        'level' => $level,
        'level_rank' => $rank,
        'probabilidad' => $prob,
        'parametro' => $param,
        'area_desc' => $areaDesc,
        'zone_code' => $zoneCode,
        'polygon' => cap_polygon_to_coords($polygonRaw)
    ];
}

function aemet_avisos_cap(string $area = 'esp', bool $includeXml = false): array
{
    $area = strtolower(trim($area ?: 'esp'));

    $meta = aemet_call_api("/api/avisos_cap/ultimoelaborado/area/$area");
    if (empty($meta['datos'])) throw new RuntimeException('avisos_cap: sin campo datos');

    $typed = aemet_download_datos_typed($meta['datos']);
    $payload = ($typed['mode'] === 'text') ? $typed['text'] : (($typed['mode'] === 'binary') ? $typed['bytes'] : null);

    if (!is_string($payload)) {
        if ($typed['mode'] === 'json') {
            return ['ok' => true, 'tipo' => 'avisos_cap', 'meta' => $meta, 'data' => $typed['json']];
        }
        throw new RuntimeException('avisos_cap: formato no soportado');
    }

    $xmlList = cap_extract_alert_xml_list($payload);

    $alerts = [];
    $xmlOut = [];
    foreach ($xmlList as $xml) {
        try {
            $alerts[] = cap_xml_to_alert($xml);
        } catch (Throwable $e) {
            $alerts[] = ['parse_error' => true, 'error' => sanitize_error_message($e->getMessage())];
        }
        if ($includeXml) $xmlOut[] = $xml;
    }

    usort($alerts, function ($a, $b) {
        $ar = (int)($a['level_rank'] ?? 0);
        $br = (int)($b['level_rank'] ?? 0);
        if ($ar !== $br) return $br <=> $ar;

        $ae = (string)($a['expires'] ?? '');
        $be = (string)($b['expires'] ?? '');
        if ($ae !== '' && $be !== '' && $ae !== $be) return strcmp($ae, $be);

        $as = (string)($a['sent'] ?? '');
        $bs = (string)($b['sent'] ?? '');
        return strcmp($bs, $as);
    });

    $out = [
        'ok' => true,
        'tipo' => 'avisos_cap',
        'req' => ['area' => $area],
        'meta' => $meta,
        'data' => [
            'count' => count($alerts),
            'alerts' => $alerts
        ]
    ];
    if ($includeXml) $out['data']['xml_clean'] = $xmlOut;

    return $out;
}

/* =========================================================
   RAYOS (GIF): URL o base64
   ========================================================= */

function aemet_rayos(bool $embedBase64 = false): array
{
    $meta = aemet_call_api("/api/red/rayos/mapa");
    if (empty($meta['datos'])) throw new RuntimeException('rayos: sin campo datos');

    if (!$embedBase64) {
        return [
            'ok' => true,
            'tipo' => 'rayos',
            'meta' => $meta,
            'data' => [
                'mode' => 'url',
                'mime' => 'image/gif',
                'datos_url' => $meta['datos']
            ]
        ];
    }

    $typed = aemet_download_datos_typed($meta['datos']);
    if ($typed['mode'] !== 'binary') {
        return ['ok' => true, 'tipo' => 'rayos', 'meta' => $meta, 'data' => $typed];
    }

    return [
        'ok' => true,
        'tipo' => 'rayos',
        'meta' => $meta,
        'data' => [
            'mode' => 'base64',
            'mime' => $typed['mime'],
            'base64' => base64_encode($typed['bytes'])
        ]
    ];
}

/* =========================================================
   INCENDIOS: normalmente binario -> devolver URL
   ========================================================= */
function aemet_incendios(string $area, string $dia, string $producto = 'previsto'): array
{
    $area = strtolower(trim($area ?: 'esp'));
    $dia  = trim($dia ?: date('Y-m-d'));
    $producto = strtolower(trim($producto ?: 'previsto'));

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dia)) {
        throw new InvalidArgumentException('dia inválido (YYYY-MM-DD)');
    }
    if (!in_array($producto, ['previsto', 'observado'], true)) {
        throw new InvalidArgumentException('producto inválido (previsto|observado)');
    }

    $path = "/api/incendios/mapasriesgo/$producto/dia/$dia/area/$area";

    try {
        $meta = aemet_call_api($path); // aquí es donde ahora mismo te “corta”
        if (empty($meta['datos'])) throw new RuntimeException('incendios: sin campo datos');

        // Si tu servidor puede bajar el "datos", genial; si no, devolvemos URL
        try {
            $typed = aemet_download_datos_typed($meta['datos']);
            if ($typed['mode'] === 'binary') {
                return [
                    'ok' => true,
                    'tipo' => 'incendios',
                    'available' => true,
                    'req' => ['area' => $area, 'dia' => $dia, 'producto' => $producto],
                    'meta' => $meta,
                    'data' => [
                        'mode' => 'url',
                        'mime' => $typed['mime'],
                        'datos_url' => $meta['datos']
                    ]
                ];
            }

            return [
                'ok' => true,
                'tipo' => 'incendios',
                'available' => true,
                'req' => ['area' => $area, 'dia' => $dia, 'producto' => $producto],
                'meta' => $meta,
                'data' => ($typed['mode'] === 'json') ? $typed['json'] : $typed
            ];
        } catch (Throwable $e2) {
            return [
                'ok' => true,
                'tipo' => 'incendios',
                'available' => true,
                'warning' => 'No se pudo descargar el recurso final desde este servidor; se devuelve la URL de "datos".',
                'error_original' => sanitize_error_message($e2->getMessage()),
                'req' => ['area' => $area, 'dia' => $dia, 'producto' => $producto],
                'meta' => $meta,
                'data' => [
                    'mode' => 'url',
                    'datos_url' => $meta['datos']
                ]
            ];
        }
    } catch (Throwable $e) {
        // ✅ Diagnóstico local (no rompe nada)
        $net = net_quick_check_https('opendata.aemet.es');

        return [
            'ok' => true,
            'tipo' => 'incendios',
            'available' => false,
            'req' => ['area' => $area, 'dia' => $dia, 'producto' => $producto],
            'warning' => 'El servicio de incendios no responde (conexión cerrada/vacía). Puede ser caída temporal o bloqueo de red. Otros endpoints pueden seguir funcionando.',
            'error_original' => sanitize_error_message($e->getMessage()),
            'diagnostico' => $net,
            'data' => null
        ];
    }
}





/* =========================================================
   REDES ESPECIALES (con filtro por estación)
   ========================================================= */

function aemet_redes_especiales(string $tipo = 'radiacion', ?string $estacion = null, string $modo = 'raw'): array
{
    $tipo = strtolower(trim($tipo ?: 'radiacion'));
    $estacion = ($estacion !== null) ? trim($estacion) : null;

    switch ($tipo) {
        case 'radiacion':
            $path = "/api/red/especial/radiacion";
            break;
        case 'ozono':
            $path = "/api/red/especial/ozono";
            break;
        case 'perfilozono':
            if ($estacion === null || $estacion === '') throw new InvalidArgumentException('perfilozono requiere estacion');
            $path = "/api/red/especial/perfilozono/estacion/" . rawurlencode($estacion);
            break;
        case 'contaminacionfondo':
            if ($estacion === null || $estacion === '') throw new InvalidArgumentException('contaminacionfondo requiere estacion');
            $path = "/api/red/especial/contaminacionfondo/estacion/" . rawurlencode($estacion);
            break;
        default:
            throw new InvalidArgumentException('tipo redes_especiales inválido');
    }

    $meta = aemet_call_api($path);
    if (empty($meta['datos'])) throw new RuntimeException('redes_especiales: sin campo datos');

    $typed = aemet_download_datos_typed($meta['datos']);

    // ✅ OPTIMIZACIÓN radiación CSV -> JSON
    if ($tipo === 'radiacion' && $typed['mode'] === 'text' && $modo === 'compact') {
        $compact = redes_radiacion_compact($typed['text'], $estacion);
        return [
            'ok' => true,
            'tipo' => 'redes_especiales',
            'req' => ['tipo' => $tipo, 'estacion' => $estacion, 'modo' => $modo],
            'meta' => $meta,
            'data' => $compact
        ];
    }

    // Por defecto: raw/typed
    return [
        'ok' => true,
        'tipo' => 'redes_especiales',
        'req' => ['tipo' => $tipo, 'estacion' => $estacion, 'modo' => $modo],
        'meta' => $meta,
        'data' => ($typed['mode'] === 'json') ? $typed['json'] : $typed
    ];
}

/* =========================================================
   ROUTER JSON
   ========================================================= */

function api_router_from_json(string $json): array
{
    $in = json_decode($json, true);
    if (!is_array($in)) return ['ok' => false, 'error' => 'JSON inválido'];

    try {
        switch ($in['accion'] ?? '') {

            case 'prediccion_municipio_horaria':
                return aemet_prediccion_municipio_horaria(
                    (string)($in['idMunicipio'] ?? ''),
                    (string)($in['modo'] ?? 'raw')
                );

            case 'avisos_cap':
                return aemet_avisos_cap(
                    (string)($in['area'] ?? 'esp'),
                    (bool)($in['include_xml'] ?? false)
                );

            case 'rayos':
                return aemet_rayos((bool)($in['embed_base64'] ?? false));

            case 'incendios':
                return aemet_incendios(
                    (string)($in['area'] ?? 'esp'),
                    (string)($in['dia'] ?? date('Y-m-d')),
                    (string)($in['producto'] ?? 'previsto')
                );

            case 'redes_especiales':
                return aemet_redes_especiales(
                    (string)($in['tipo'] ?? 'radiacion'),
                    isset($in['estacion']) ? (string)$in['estacion'] : null,
                    (string)($in['modo'] ?? 'raw') // raw|compact (compact solo implementado para radiacion)
                );

            default:
                return ['ok' => false, 'error' => 'Acción no soportada'];
        }
    } catch (Throwable $e) {
        return ['ok' => false, 'error' => sanitize_error_message($e->getMessage())];
    }
}

/**
 * GET especializado SOLO para el endpoint de incendios.
 * No toca el resto del sistema para no romper nada.
 */
function http_get_incendios(string $url, int $timeout = 60, int $retries = 2): array
{
    $lastErr = null;

    // --- Intento 1: cURL "relajado" (solo aquí) + TLS1.2 + HTTP/1.1 + retries
    if (function_exists('curl_init')) {
        for ($i = 0; $i <= $retries; $i++) {
            $ch = curl_init($url);
            $respHeaders = [];

            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS      => 5,
                CURLOPT_CONNECTTIMEOUT => 15,
                CURLOPT_TIMEOUT        => $timeout,
                CURLOPT_USERAGENT      => 'PHP-AEMET-Incendios',
                CURLOPT_HTTPHEADER     => ['Accept: application/json', 'Connection: close'],
                CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,

                // SOLO INCENDIOS: relajar verificación (evita EOF en algunos hostings)
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => 0,

                // Forzar TLS 1.2 (si está disponible)
                CURLOPT_SSLVERSION     => defined('CURL_SSLVERSION_TLSv1_2') ? CURL_SSLVERSION_TLSv1_2 : 0,

                CURLOPT_HEADERFUNCTION => function ($ch, $headerLine) use (&$respHeaders) {
                    $len = strlen($headerLine);
                    $respHeaders[] = trim($headerLine);
                    return $len;
                },
            ]);

            $body = curl_exec($ch);
            $errno = curl_errno($ch);
            $err   = curl_error($ch);
            $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);

            if ($body !== false && $errno === 0) {
                return ['status' => $status, 'body' => $body, 'headers' => $respHeaders];
            }

            $lastErr = "cURL error: $err";
            // pequeño retry
            usleep(150000); // 150ms
        }
    }

    // --- Intento 2: stream context forzando TLS1.2 (fallback)
    for ($i = 0; $i <= $retries; $i++) {
        $ctx = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => $timeout,
                'ignore_errors' => true,
                'header' => "User-Agent: PHP-AEMET-Incendios\r\nAccept: application/json\r\nConnection: close\r\n",
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'crypto_method' => defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')
                    ? STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT
                    : STREAM_CRYPTO_METHOD_TLS_CLIENT,
            ]
        ]);

        $body = @file_get_contents($url, false, $ctx);
        $headers = $http_response_header ?? [];

        if ($body !== false) {
            $status = 0;
            if (isset($headers[0]) && preg_match('#HTTP/\d\.\d\s+(\d{3})#', $headers[0], $m)) {
                $status = (int)$m[1];
            }
            return ['status' => $status, 'body' => $body, 'headers' => $headers];
        }

        $lastErr = "HTTP stream error en $url";
        usleep(150000);
    }

    throw new RuntimeException($lastErr ?: "HTTP error en $url");
}

function net_quick_check_https(string $host, int $port = 443, int $timeout = 6): array
{
    $result = [
        'host' => $host,
        'dns' => null,
        'tcp_443' => false,
        'tls_handshake' => false,
        'error' => null,
    ];

    $ip = @gethostbyname($host);
    $result['dns'] = ($ip && $ip !== $host) ? $ip : null;

    $errno = 0;
    $errstr = '';
    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'crypto_method' => defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')
                ? STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT
                : STREAM_CRYPTO_METHOD_TLS_CLIENT,
        ]
    ]);

    $fp = @stream_socket_client(
        "ssl://{$host}:{$port}",
        $errno,
        $errstr,
        $timeout,
        STREAM_CLIENT_CONNECT,
        $ctx
    );

    if ($fp) {
        $result['tcp_443'] = true;
        $result['tls_handshake'] = true;
        fclose($fp);
    } else {
        $result['error'] = "socket: ($errno) $errstr";
        // si no abre ssl:// probamos tcp:// (para distinguir bloqueo TLS vs puerto)
        $fp2 = @stream_socket_client("tcp://{$host}:{$port}", $errno2, $errstr2, $timeout);
        if ($fp2) {
            $result['tcp_443'] = true;
            fclose($fp2);
        }
    }

    return $result;
}
