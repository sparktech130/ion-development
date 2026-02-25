<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_grid = null;
if (isset($jsonobj2->cod_grid)) {
    $cod_grid = $jsonobj2->cod_grid;
}

$delete = eliminarGridUsuarios(
    $cod_grid
);

acabarRequest($delete);
