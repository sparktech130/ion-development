<?php
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/dispositivos/main.php";

$jsonobj = file_get_contents("php://input");
$jsonobj2 = json_decode($jsonobj);

$cod_dispositivo = $jsonobj2->cod_dispositivo ?? null;
$deviceId = $jsonobj2->deviceId ?? null;
$nom_dispositivo = $jsonobj2->nom_dispositivo ?? null;
$ip_dispositivo = $jsonobj2->ip_dispositivo ?? null;
$direccion = $jsonobj2->direccion ?? null;
$coordenadas = $jsonobj2->coordenadas ?? null;
$cod_provincia = $jsonobj2->cod_provincia ?? null;
$cod_poblacion = $jsonobj2->cod_poblacion ?? null;
$cp = $jsonobj2->cp ?? null;

$cod_modelo = $jsonobj2->cod_modelo ?? null;
$cod_fabricante = $jsonobj2->cod_fabricante ?? null;
$cod_categoria = $jsonobj2->cod_categoria ?? null;
$nombre_modelo = $jsonobj2->nombre_modelo ?? null;
$nombre_fabricante = $jsonobj2->nombre_fabricante ?? null;
$nombre_categoria = $jsonobj2->nombre_categoria ?? null;

$cod_nodo = $jsonobj2->cod_nodo ?? null;
$serial_number = $jsonobj2->serial_number ?? null;
$protocolo_ip = $jsonobj2->protocolo_ip ?? null;
$puerta_enlace = $jsonobj2->puerta_enlace ?? null;
$mascara_red = $jsonobj2->mascara_red ?? null;
$direccion_mac = $jsonobj2->direccion_mac ?? null;
$servidor_dhcp = $jsonobj2->servidor_dhcp ?? null;

$modulos = $jsonobj2->modulos ?? null;

$cod_sector = $jsonobj2->cod_sector ?? null;
$cod_cloud = $jsonobj2->cod_cloud ?? null;

$deveui = $jsonobj2->deveui ?? null;
$appeui = $jsonobj2->appeui ?? null;
$appkey = $jsonobj2->appkey ?? null;
$username = $jsonobj2->username ?? null;
$password = $jsonobj2->password ?? null;

$comprobarRadar = $jsonobj2->comprobarRadar ?? false;
$comprobarCanalActivo = $jsonobj2->comprobarCanalActivo ?? true;

$dispositivos = obtenerDispositivos(
    cod_dispositivo: $cod_dispositivo,
    nom_dispositivo: $nom_dispositivo,
    direccion: $direccion,
    cp: $cp,
    coordenadas: $coordenadas,
    cod_provincia: $cod_provincia,
    cod_poblacion: $cod_poblacion,
    serial_number: $serial_number,
    cod_modelo: $cod_modelo,
    cod_fabricante: $cod_fabricante,
    cod_categoria: $cod_categoria,
    cod_nodo: $cod_nodo,
    puerta_enlace: $puerta_enlace,
    servidor_dhcp: $servidor_dhcp,
    mascara_red: $mascara_red,
    protocolo_ip: $protocolo_ip,
    ip_dispositivo: $ip_dispositivo,
    direccion_mac: $direccion_mac,
    nombre_modelo: $nombre_modelo,
    nombre_fabricante: $nombre_fabricante,
    nombre_categoria: $nombre_categoria,
    deveui: $deveui,
    appeui: $appeui,
    appkey: $appkey,
    username: $username,
    password: $password,
    modulosFiltro: $modulos,
    deviceId: $deviceId,
    cod_sector: $cod_sector,
    cod_cloud: $cod_cloud,
    comprobarRadar: $comprobarRadar,
    comprobarCanalActivo: $comprobarCanalActivo
);

acabarRequest($dispositivos);
