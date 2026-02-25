<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/areas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_area = $jsonobj2->cod_area ?? null;

$delete = eliminarAreaRestringida($cod_area);

acabarRequest($delete);

