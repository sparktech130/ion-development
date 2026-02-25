<?php
sendHeaders([
    "Access-Control-Allow-Origin: *",
    "Access-Control-Expose-Headers: Content-Length, X-JSON",
    "Access-Control-Allow-Methods: GET, POST, OPTIONS",
    "Access-Control-Allow-Credentials: true",
    "Access-Control-Allow-Headers: Authorization, Content-Type",
    "Content-Type: application/json",
]);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); 
}
