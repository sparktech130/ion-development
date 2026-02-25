<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_permiso = $jsonobj2->cod_permiso ?? null;

acabarRequest(eliminarPermisos($cod_permiso));

