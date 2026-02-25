<?php
use Funciones\NxConnection;

$jsonobj = file_get_contents("php://input");

$jsonobj2 = json_decode($jsonobj);

include_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";

$cod_cloud = $jsonobj2->cod_cloud ?? null;
$limit = $jsonobj2->limit ?? null;

$datos_cloud = obtenerCloudsParam($cod_cloud);

if (
    isset($datos_cloud["error"]) ||
        !is_array($datos_cloud) ||
        empty($datos_cloud) ||
        count($datos_cloud) > 1
) {
    acabarRequest([
        "message" => "Cloud no encontrado o no es único",
        "error" => true
    ], 500);
}
$datos_cloud = $datos_cloud[0];

$systemId = $datos_cloud->systemId;
$ip = $datos_cloud->ip;
$puerto = $datos_cloud->puerto;
$user = $datos_cloud->user;
$password = $datos_cloud->password;

$nx = new NxConnection(
    $systemId,
    $ip,
    $puerto,
    $user,
    $password,
);

acabarRequest($nx->events(
    method: "GET",
    limit: $limit,
));



