<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$foto_perfil = null;
if (isset($_FILES["foto_perfil"])) {
    $extension = strtolower(pathinfo($_FILES["foto_perfil"]["name"], PATHINFO_EXTENSION));
    $uploaddir = "../fotos_perfil/";

    $foto_perfil = $uploaddir . date("Ymd_Hisv", time()) . "-$cod_usuario_token" . ".$extension";

    move_uploaded_file($_FILES["foto_perfil"]["tmp_name"], $foto_perfil);
    $foto_perfil = ltrim($foto_perfil, "\.\./");
}

$login = $_POST["login"] ?? null;

$nombre_usuario = $_POST["nombre_usuario"] ?? null;
$password = $_POST["password"] ?? null;
$permisos = (int)$_POST["permisos"] ?? null;
$idioma = $_POST["idioma"] ?? null;
$email = $_POST["email"] ?? null;
$telefono = $_POST["telefono"] ?? null;
$cod_usuario = $_POST["cod_usuario"] ?? null;
$nombre = $_POST["nombre"] ?? null;
$apellidos = $_POST["apellidos"] ?? null;

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

if ($cod_usuario_token == $cod_usuario) {
    acabarRequest(modificarUsuarios(
        login: $login,
        nombre_usuario: $nombre_usuario,
        foto_perfil: $foto_perfil,
        password: $password,
        idioma: $idioma,
        email: $email,
        telefono: $telefono,
        nombre: $nombre,
        apellidos: $apellidos,
        cod_usuario: $cod_usuario
    ));
} else if ($permisosEditar == true || $permisosUsuario == 1) {
    if ($permisosUsuario != 1 && $permisos == 1) {
        acabarRequest([
            "message" => "No tienes los permisos necesarios", 
            "error" => true,
        ], 500);
    }

    acabarRequest(modificarUsuarios(
        login: $login,
        nombre_usuario: $nombre_usuario,
        foto_perfil: $foto_perfil,
        password: $password,
        permisos: $permisos,
        idioma: $idioma,
        email: $email,
        telefono: $telefono,
        nombre: $nombre,
        apellidos: $apellidos,
        cod_usuario: $cod_usuario
    ));
}

acabarRequest([
    "message" => "No tienes los permisos necesarios", 
    "error" => true,
], 500);

