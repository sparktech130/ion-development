<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/core/consts.php";

$sql = "SELECT cod_reconoc, foto FROM {{.CORE}}.vehiculos_reconocidos WHERE foto like '10-2025%';";
$recons = ejecutarConsultaSQL(
    obtenerConexion(),
    $sql,
    [],
    true,
);

foreach ($recons as $r) {
    $foto = str_replace("10-2025", "2025-10", $r->foto);
    echo renderQuery("UPDATE {{.CORE}}.vehiculos_reconocidos SET foto = '$foto' WHERE cod_reconoc = '{$r->cod_reconoc}';\n");
}
echo count($r);

