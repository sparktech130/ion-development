<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/infracciones/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_infraccion = $jsonobj2->cod_infraccion ?? null;
$desc_infraccion = $jsonobj2->desc_infraccion ?? null;
$importe_infraccion = $jsonobj2->importe_infraccion ?? null;
$importe_reducido = $jsonobj2->importe_reducido ?? null;
$puntos = $jsonobj2->puntos ?? null;
$cod_modulo = $jsonobj2->cod_modulo ?? null;

acabarRequest(insertarInfraccion(
    cod_infraccion: $cod_infraccion,
    desc_infraccion: $desc_infraccion,
    importe_infraccion: $importe_infraccion,
    importe_reducido: $importe_reducido,
    puntos: $puntos,
    cod_modulo: $cod_modulo
));

