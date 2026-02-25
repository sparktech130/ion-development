<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/sistema/main.php";

$data = system_lsblk();
if (isset($data->error)) {
    acabarRequest($data);
}

$data = array_values(array_filter(
    array: $data->blockdevices,
    callback: function ($d) {
        return $d->type != "loop";
    },
));
acabarRequest($data);

