<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

function system_lsblk() {
    $output = [];
    $cmd = exec(
        command: "lsblk --json --tree --output name,uuid,size,type",
        output: $output,
    );

    if (!$cmd) {
        return (object)["message" => "Error al ejecutar comando.", "error" => true];
    }

    $output = json_decode(implode("\n", $output));

    return $output;
}
