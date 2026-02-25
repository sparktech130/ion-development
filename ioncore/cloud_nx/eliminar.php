<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/cloud_nx/main.php";

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

$cod_cloud = $jsonobj2->cod_cloud ?? null;

$delete = eliminarCloudNx($cod_cloud);

if ($delete === true) {
    enviarActualizacionCloudsNx("updates", $cod_cloud);
}

acabarRequest($delete);
