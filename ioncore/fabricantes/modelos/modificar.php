<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/fabricantes/main.php";

$modifica = false;

$cod_modelo = null;
if (isset($_POST["cod_modelo"])) {
    $cod_modelo = $_POST["cod_modelo"];
}

$nombre_modelo = null;
if (isset($_POST["nombre_modelo"])) {
    $nombre_modelo = $_POST["nombre_modelo"];
    $modifica = true;
}

$foto_modelo = null;
if (isset($_FILES["foto_modelo"])) {
    $extension = strtolower(pathinfo($_FILES["foto_modelo"]["name"], PATHINFO_EXTENSION));
    $uploaddir = "../fotos_modelos/";
    $foto_modelo = $uploaddir . date("Ymd_Hisv", time()) . "-$cod_modelo" . ".$extension";

    if (isset($cod_modelo)) {
        move_uploaded_file($_FILES["foto_modelo"]["tmp_name"], $foto_modelo);
    }

    $foto_modelo = ltrim($foto_modelo, "\.\./");
    $modifica = true;
}

$descripcion_modelo = null;
if (isset($_POST["descripcion_modelo"])) {
    $descripcion_modelo = $_POST["descripcion_modelo"];
    $modifica = true;
}

$cod_fabricante = null;
if (isset($_POST["cod_fabricante"])) {
    $cod_fabricante = $_POST["cod_fabricante"];
    $modifica = true;
}

$cod_categoria = null;
if (isset($_POST["cod_categoria"])) {
    $cod_categoria = $_POST["cod_categoria"];
    $modifica = true;
} 

if (isset($cod_modelo) && $modifica) {
    acabarRequest(modificarModelos(
        $cod_modelo, 
        $nombre_modelo, 
        $foto_modelo, 
        $descripcion_modelo, 
        $cod_fabricante, 
        $cod_categoria,
    ));
} 
acabarRequest(false);
