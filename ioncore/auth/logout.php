<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/auth/main.php";

acabarRequest(logout($cod_usuario_token, $cod_sesion));
