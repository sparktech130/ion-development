<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/ioncity/campaigns/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_campaign = $jsonobj2->cod_campaign ?? null;

$insert = eliminarCampaign($cod_campaign);

acabarRequest($insert);

