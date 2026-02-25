<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Expose-Headers: Content-Length, X-JSON");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}
