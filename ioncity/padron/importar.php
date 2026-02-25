<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/padron/main.php";

if (!(isset($_FILES['archivo_csv']) && $_FILES['archivo_csv']['error'] === UPLOAD_ERR_OK)) {
    acabarRequest([
        "message" => "Archivo csv no recibido",
        "error" => true,
    ], 500);
}

$archivo_csv = fopen($_FILES['archivo_csv']['tmp_name'], 'r');
$import = importarVehiculosPadron($archivo_csv);

acabarRequest($import);
