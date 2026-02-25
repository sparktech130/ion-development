<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/fabricantes/main.php";

$modifica = false;

$cod_fabricante = null;
if (isset($_POST["cod_fabricante"])) {
    $cod_fabricante = $_POST["cod_fabricante"];
}

$nombre_fabricante = null;
if (isset($_POST["nombre_fabricante"])) {
    $nombre_fabricante = $_POST["nombre_fabricante"];
    $modifica = true;
} 

$logo_fabricante = null;
if (isset($_FILES["logo_fabricante"])) {
    $extension = strtolower(pathinfo($_FILES["logo_fabricante"]["name"], PATHINFO_EXTENSION));
    $uploaddir = "../fotos_fabricantes/";
    $logo_fabricante = $uploaddir . date("Ymd_Hisv", time()) . "-$nombre_fabricante" . ".$extension";

    if (isset($cod_fabricante)) {
        move_uploaded_file($_FILES["logo_fabricante"]["tmp_name"], $logo_fabricante);
    }
    $modifica = true;
    $logo_fabricante = ltrim($logo_fabricante, "\.\./");
}

$descripcion_fabricante = null;
if (isset($_POST["descripcion_fabricante"])) {
    $descripcion_fabricante = $_POST["descripcion_fabricante"];
    $modifica = true;
} 

if (isset($cod_fabricante) && $modifica) {
    acabarRequest(modificarFabricantes($cod_fabricante, $nombre_fabricante, $logo_fabricante, $descripcion_fabricante));
} 
acabarRequest(false);
