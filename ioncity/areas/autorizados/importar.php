<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/areas/main.php";

if (!(
    isset($_FILES['archivo_csv']) &&
        $_FILES['archivo_csv']['error'] === UPLOAD_ERR_OK
)) {
    acabarRequest(["message" => "Archivo csv no recibido", "error" => true]);
}

$cod_area = $_POST["cod_area"] ?? null;
$archivo_csv = fopen($_FILES['archivo_csv']['tmp_name'], 'r');

acabarRequest(importarAreaAutorizados(
    $cod_area, 
    $archivo_csv,
));
