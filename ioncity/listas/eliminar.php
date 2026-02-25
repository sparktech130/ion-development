<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/ioncity/listas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_lista = $jsonobj2->cod_lista ?? null;

$delete = eliminarLista($cod_lista);

if ($delete == false){
    http_response_code(500);
}

acabarRequest($delete);

