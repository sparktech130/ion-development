<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/reconocimientos_personas/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$refTrackingId = $jsonobj2->refTrackingId ?? null;

$recon = obtenerFotoOriginal(
    refTrackingId: $refTrackingId,
);
acabarRequest($recon);
