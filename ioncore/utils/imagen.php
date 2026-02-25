<?php

function gd_free($img): void
{
    if ($img instanceof GdImage || is_resource($img)) {
        imagedestroy($img);
    }
}

/**
 * Recorta una imagen base64 usando coordenadas y devuelve el recorte en base64.
 *
 * @param string $base64    Imagen en base64 (puede incluir data:image/...;base64,)
 * @param int    $x         Coordenada X (px)
 * @param int    $y         Coordenada Y (px)
 * @param int    $w         Ancho del recorte (px)
 * @param int    $h         Alto del recorte (px)
 * @param string $outMime   Mime de salida: 'image/png' | 'image/jpeg' | 'image/webp'
 * @param bool   $addPrefix Añade prefijo "data:image/$outMime;base64"
 * @param int    $quality   Calidad (JPEG/WebP). JPEG: 0-100, WebP: 0-100
 *
 * @return string Base64 con prefijo data:<mime>;base64,
 * @throws InvalidArgumentException|RuntimeException
 */
function cropBase64Image(
    string $base64,
    int $x,
    int $y,
    int $w,
    int $h,
    string $outMime = 'image/png',
    bool $addPrefix = false,
    int $quality = 90,
): string {
    if ($w <= 0 || $h <= 0) throw new InvalidArgumentException("w y h deben ser > 0");

    if (preg_match('/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/', $base64, $m)) {
        $raw = $m[2];
    } else {
        $raw = $base64;
    }

    $bin = base64_decode($raw, true);
    if ($bin === false) throw new InvalidArgumentException("Base64 inválido");

    $src = @imagecreatefromstring($bin);
    if (!$src) throw new RuntimeException("No se pudo crear la imagen (GD)");

    $srcW = imagesx($src);
    $srcH = imagesy($src);

    $x = max(0, min($x, $srcW));
    $y = max(0, min($y, $srcH));
    $w = max(0, min($w, $srcW - $x));
    $h = max(0, min($h, $srcH - $y));

    if ($w === 0 || $h === 0) {
        gd_free($src);
        throw new InvalidArgumentException("Recorte fuera o tamaño 0");
    }

    $dst = imagecreatetruecolor($w, $h);
    if (!$dst) {
        gd_free($src);
        throw new RuntimeException("No se pudo crear la imagen destino");
    }

    if ($outMime === 'image/png') {
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
        imagefilledrectangle($dst, 0, 0, $w, $h, $transparent);
    }

    if (!imagecopy($dst, $src, 0, 0, $x, $y, $w, $h)) {
        gd_free($src);
        gd_free($dst);
        throw new RuntimeException("Falló el recorte");
    }

    ob_start();
    switch ($outMime) {
        case 'image/jpeg':
            imagejpeg($dst, null, max(0, min(100, $quality)));
            break;
        case 'image/webp':
            if (!function_exists('imagewebp')) {
                ob_end_clean();
                gd_free($src);
                gd_free($dst);
                throw new RuntimeException("GD no soporta WebP");
            }
            imagewebp($dst, null, max(0, min(100, $quality)));
            break;
        case 'image/png':
        default:
            imagepng($dst, null, 6);
            $outMime = 'image/png';
            break;
    }
    $outBin = ob_get_clean();

    gd_free($src);
    gd_free($dst);

    if (!is_string($outBin) || $outBin === '') throw new RuntimeException("No se pudo serializar la imagen");

    $out = base64_encode($outBin);
    if ($addPrefix) {
        return "data:{$outMime};base64,{$out}";
    }
    return $out;
}
