<?php
include_once $_SERVER['DOCUMENT_ROOT'] . "/core/dispositivos/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$nombre = $jsonobj2->nombre ?? null;

$rows = obtenerMaquinas(
    nombre: $nombre,
);
acabarRequest($rows);
