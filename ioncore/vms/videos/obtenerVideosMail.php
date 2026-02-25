<?php
$_SESSION["AUTH_TYPE"] = "vms";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/vms/main.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/verificarToken/tokenVideos.php";

acabarRequest(obtenerVideosRecibidos(usuario_compartido: $email_usuario_token));
