<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$jsonobj = file_get_contents("php://input");
$jsonDecode = json_decode($jsonobj);

$cod_usuario = $jsonDecode->cod_usuario;

// Obtenemos los permisos del usuario actual ($cod_usuario_token)
$permisosDecode = verPermisos($cod_usuario_token, "USUARIOS") ?? new stdClass;
$permisosEditar = false;
$permisosUsuario = 0;

if ($permisosDecode &&
    is_array($permisosDecode) &&
    !empty($permisosDecode) && 
    !isset($permisosDecode["error"])
) {
    $permisosEditar = $permisosDecode[0]->editar ?? false;
    $permisosUsuario = (int) $permisosDecode[0]->permisos ?? 0;
}

if ($permisosUsuario != 1) {
    acabarRequest([
        "message" => "No tienes los permisos necesarios",
        "error" => true
    ], 500);
} 

acabarRequest(eliminarUsuarios($cod_usuario));
