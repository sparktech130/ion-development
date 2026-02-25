<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/fabricantes/main.php";

$nombre_fabricante = $_POST["nombre_fabricante"] ?? null;
$descripcion_fabricante = $_POST["descripcion_fabricante"] ?? null;

$logo_fabricante = null;
if (isset($_FILES["logo_fabricante"])) {
	$extension = strtolower(pathinfo($_FILES["logo_fabricante"]["name"], PATHINFO_EXTENSION));
	$uploaddir = "../fotos_fabricantes/";
	$logo_fabricante = $uploaddir . date("Ymd_Hisv", time()) . "-$nombre_fabricante" . ".$extension";
}

if (!(
	isset($nombre_fabricante)
	&& isset($logo_fabricante)
	&& isset($descripcion_fabricante)
)) {
    acabarRequest(false);
}

move_uploaded_file($_FILES["logo_fabricante"]["tmp_name"], $logo_fabricante);
$logo_fabricante = ltrim($logo_fabricante, "\.\.\/");

acabarRequest(insertarFabricantes($nombre_fabricante, $logo_fabricante, $descripcion_fabricante));
