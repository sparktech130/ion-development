<?php
$_SESSION["AUTHED"] = false;
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/auth/main.php";
$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$username = $jsonobj2->login;
$password = $jsonobj2->password;

$login = obtenerLogin($username, $password);
if (empty($login) || isset($login["error"])) {
    acabarRequest(false, 500);
}

$_SESSION['cod_usuario'] = $login[0]->cod_usuario;
$_SESSION['nombre'] = $login[0]->nombre;
$_SESSION['apellidos'] = $login[0]->apellidos;
$_SESSION['permisos'] = $login[0]->permisos;
$_SESSION['username'] = $username;
$_SESSION['email'] = $login[0]->email;
$_SESSION['idioma'] = $login[0]->idioma ?? null;
$_SESSION['foto_perfil'] = "fotos/" . $login[0]->foto_perfil;
$_SESSION['ioncop_access'] = $login[0]->ioncop_access;

$cod_accion = "1-LGI";
insertLogUsuario(
    cod_usuario: $_SESSION['cod_usuario'],
    cod_accion: $cod_accion,
);
$_SESSION['cod_sesion'] = obtenerCodSesion($_SESSION['cod_usuario']);

$datos = [
    'cod_usuario' => $_SESSION['cod_usuario'],
    'email' => $_SESSION['email'],
    'permisos' => $_SESSION['permisos'],
    'username' => $_SESSION['username'],
    'nombre' => $_SESSION['nombre'],
    'apellidos' => $_SESSION['apellidos'],
    'idioma' => $_SESSION['idioma'],
    'foto_perfil' => $_SESSION['foto_perfil'],
    'ioncop_access' => $_SESSION['ioncop_access'],
];

$cod_usuario = $login[0]->cod_usuario;
insertLogUsuario2FA(
    cod_usuario: $cod_usuario,
    cod_accion: "0-AUTH",
    recuperarPwd: false,
);

acabarRequest($datos);
