<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/fabricantes/main.php";

$nombre_modelo = $_POST["nombre_modelo"] ?? null;

$foto_modelo = null;
if (isset($_FILES["foto_modelo"])) {
	$extension = strtolower(pathinfo($_FILES["foto_modelo"]["name"], PATHINFO_EXTENSION));
	$uploaddir = "../fotos_modelos/";
	$foto_modelo = $uploaddir . date("Ymd_Hisv", time()) . "-$nombre_modelo" . ".$extension";
}

$descripcion_modelo = $_POST["descripcion_modelo"] ?? null;
$cod_fabricante = $_POST["cod_fabricante"] ?? null;
$cod_categoria = $_POST["cod_categoria"] ?? null;

if (
    isset($nombre_modelo) &&
        isset($foto_modelo) &&
        isset($descripcion_modelo) &&
        isset($cod_fabricante) &&
        isset($cod_categoria)
) {
	move_uploaded_file($_FILES["foto_modelo"]["tmp_name"], $foto_modelo);

    $foto_modelo = ltrim($foto_modelo, "\.\./");
    acabarRequest(insertarModelos($nombre_modelo, $foto_modelo, $descripcion_modelo, $cod_fabricante, $cod_categoria));
} 
acabarRequest(false);
