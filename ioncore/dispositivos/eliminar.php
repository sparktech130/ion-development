<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;

$delete = eliminarDispositivos($cod_dispositivo);

$returnObj = ["delete" => $delete];
if ($delete === true) {
    enviarActualizacionDispositivos("deletes", $cod_dispositivo);
}

acabarRequest($returnObj);
