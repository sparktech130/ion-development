<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/header.php";

use Funciones\Instancia;
use CVUtils\Utils;

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$instanceId = $jsonobj2->instanceId ?? null;
if (!$instanceId) {
    Utils::acabarRequest([]);
}

$clouds = obtenerCloudsAnalysis(null, $instanceId);
if (!(
    is_array($clouds) &&
        !empty($clouds) &&
        count($clouds) == 1 &&
        !isset($clouds["error"]) 
)){
    Utils::acabarRequest(false);
}

$c = $clouds[0];
$i = new Instancia(Utils::obtenerServer($c->ip, $c->puerto));

Utils::acabarRequest($i->instance_unload($instanceId));
