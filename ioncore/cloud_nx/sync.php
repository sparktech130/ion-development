<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/cloud_nx/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);
$cod_cloud = $jsonobj2->cod_cloud ?? null;

$dispositivos = obtenerDispositivosSincronizar($cod_cloud);
$bd = obtenerConexion();
$nombre_tabla = "{{.CORE}}.dispositivos";
$sql = "";
$values = [];
foreach ($dispositivos as $disp) {
    $sql .= "UPDATE {$nombre_tabla} SET direccion_mac = '{$disp["mac"]}' WHERE deviceId = '{$disp["deviceId"]}';\n";
    continue;
}
echo $sql;

