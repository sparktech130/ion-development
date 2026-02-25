<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/usuarios/main.php";

$LONGITUD_CONTRASEÑA = 8;

// Obtenemos los permisos del usuario actual ($cod_usuario_token)
$permisosDecode = verPermisos($cod_usuario_token, "USUARIOS") ?? new stdClass;
$permisosEditar = false;
$permisosUsuario = 0;

if (
    $permisosDecode &&
    is_array($permisosDecode) &&
    !empty($permisosDecode) &&
    !isset($permisosDecode["error"])
) {
    $permisosEditar = $permisosDecode[0]->editar ?? false;
    $permisosUsuario = (int) $permisosDecode[0]->permisos ?? 0;
}

if (!($permisosEditar == true || $permisosUsuario == 1)) { //SI ES ADMIN PODRA INSERTAR
    acabarRequest(["message" => "No tienes los permisos necesarios", "error" => true], 500);
}

$foto_perfil = null;
if (isset($_FILES["foto_perfil"])) {
    $extension = strtolower(pathinfo($_FILES["foto_perfil"]["name"], PATHINFO_EXTENSION));
    $uploaddir = "../fotos_perfil/";
    // echo date("Ymd_His", time()) . "-$currUser";
    $foto_perfil = $uploaddir . date("Ymd_Hisv", time()) . "-$cod_usuario_token" . ".$extension";
    // print_r($_FILES["foto_perfil"]);
    move_uploaded_file($_FILES["foto_perfil"]["tmp_name"], $foto_perfil);
    $foto_perfil = ltrim($foto_perfil, "\.\./");
}

$permisos = null;
if (isset($_POST["permisos"])) {
    $permisos = (int)$_POST["permisos"];

    if ($permisosUsuario != 1 && $permisos == 1) {
        acabarRequest(["message" => "No tienes los permisos necesarios", "error" => true], 500);
    }
}

$login = $_POST["login"] ?? null;
$nombre_usuario = $_POST["nombre_usuario"] ?? null;
$nombre = $_POST["nombre"] ?? null;
$apellidos = $_POST["apellidos"] ?? null;
$email = $_POST["email"] ?? null;
$idioma = $_POST["idioma"] ?? null;
$telefono = $_POST["telefono"] ?? null;
$ioncop_access = $_POST["ioncop_access"] ?? false;

$password = generatePassword($LONGITUD_CONTRASEÑA);

$resultInsert = insertarUsuarios(
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
    ioncop_access: $ioncop_access,
);
if ($resultInsert === true) {
    enviarCorreoPassword($email, $nombre, $login, $password);
}

acabarRequest($resultInsert);

function generatePassword($length)
{
    $caracteres = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $password = "";

    for ($i = 0; $i < $length; $i++) {
        $indice = rand(0, strlen($caracteres) - 1);
        $password .= $caracteres[$indice];
    }

    return $password;
}
