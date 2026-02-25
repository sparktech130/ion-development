<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/infracciones/main.php";

// Verifica si se ha enviado un archivo CSV
$cod_modulo = $_POST["cod_modulo"] ?? null;

if (isset($_FILES['archivo_csv']) && $_FILES['archivo_csv']['error'] === UPLOAD_ERR_OK) {
    $archivo_csv = fopen($_FILES['archivo_csv']['tmp_name'], 'r');

    acabarRequest(importarInfracciones(
        $archivo_csv, 
        $cod_modulo,
    ));
}

acabarRequest([
    "message" => "Archivo csv no recibido",
    "error" => true,
]);

