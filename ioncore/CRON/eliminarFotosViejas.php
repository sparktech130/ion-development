<?php
// Directorio donde se encuentran las fotos
$directorios = [
    $_SERVER['DOCUMENT_ROOT'] . '/core/fotos/',
];

// Obtener la fecha actual
$fechaActual = time();

foreach ($directorios as $key => $dir) {
    // Obtener la lista de archivos en el directorio e interiores
    $imagenes = [];
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir)
    );

    foreach ($it as $file) {
        if ($file->isFile() && preg_match('/\.(jpg|jpeg|png)$/i', $file->getFilename())) {
            // Verificar si el archivo está en un directorio llamado "alertas"
            $pathParts = explode(DIRECTORY_SEPARATOR, $file->getPath());
            if (in_array('alertas', $pathParts)) {
                continue; // Saltar archivos en directorios "alertas"
            }
            $imagenes[] = $file->getPathname();
        }
    }

    // Iterar a través de los archivos en el directorio
    foreach ($imagenes as $img) {
        // Ignorar los directorios y archivos especiales (por ejemplo, "." y "..")
        if ($img == '.' || $img == '..') {
            continue;
        }

        $fechaModificacion = filemtime($img);

        $antiguedadEnDias = floor(($fechaActual - $fechaModificacion) / (60 * 60 * 24));

        // Comprobar si el archivo tiene más de 30 días de antigüedad y eliminarlo
        if ($antiguedadEnDias > 15) {
            unlink($img);
            echo "Archivo {$img} -> $antiguedadEnDias días.\n";
        }
    }
}
echo "Proceso completado.";
