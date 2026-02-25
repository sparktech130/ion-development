<?php
function enviarPorFTP(
    $host, 
    $username, 
    $password, 
    $file, 
    $remote_file,
) {
    // Conexión a FTP
    $port = 21;
    $ftp = ftp_connect($host, $port);
    if ($ftp == null) {
        return [
            "message" => "Error al conectar con el servidor FTP.",
            "error" => true,
        ];
    }
    ftp_login($ftp, $username, $password);

    if (ftp_put($ftp, $remote_file, $file, FTP_ASCII, 0)) {
        return true;
    } 

    return [
        "message" => "Error al subir el fichero en el servidor FTP.",
        "error" => true,
    ];
}

