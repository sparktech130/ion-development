<?php
require_once "consts.php";
class BaseDatos {
    private static $instance = null;
    private $pdo;
    private $type;
    private $timeoutSeconds;

    public function __construct($type = null, $timeoutSeconds = null) {
        $this->type = $type;
        $this->timeoutSeconds = $timeoutSeconds;
        $start = time();

        while (true) {
            try {
                $this->connect();
                break;
            } catch (PDOException $e) {
                if (time() - $start >= $this->timeoutSeconds) {
                    throw new RuntimeException(
                        "Timeout: no se pudo adquirir una conexión en {$this->timeoutSeconds} segundos: {$e->getMessage()}",
                    );
                }

                usleep(500_000); // Espera 500 ms antes de reintentar
                continue;
            }
        }
    }

    private function connect() {
        $prefix = match ($this->type) {
            "ionsmart" => "IONSMART_MYSQL",
            default => "MYSQL"
        };

        $c = [
            "user" => $_ENV["{$prefix}_USER"],
            "password" => $_ENV["{$prefix}_PASSWORD"],
            "host" => $_ENV["{$prefix}_HOST"] ?? "localhost",
            "port" => $_ENV["{$prefix}_PORT"] ?? "3306",
        ];

        try {
            $this->pdo = new PDO(
                "mysql:host={$c["host"]};port={$c["port"]}",
                $c["user"],
                $c["password"],
            );
            $this->pdo->query("set names utf8;");
            $this->pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            acabarRequest(errorAlObtenerDatos(__FUNCTION__, "obtener", $e, true));
        }
    }

    public static function getInstance($type = "base") {
        if (!isset(self::$instance[$type])) {
            self::$instance[$type] = new self($type);
        }
        return self::$instance[$type];
    }

    public function getConnection() {
        $start = time();

        while (true) {
            try {
                $this->pdo->query("SELECT 1");
            } catch (PDOException $e) {
                if ($e->getCode() == 2006 || $e->getCode() == 2013) { // "MySQL server has gone away".
                    $this->connect();  // Intentar reconectar si la conexión se ha perdido.
                    continue;
                }

                if (time() - $start >= $this->timeoutSeconds) {
                    throw new RuntimeException(
                        "Timeout: no se pudo adquirir una conexión en {$this->timeoutSeconds} segundos: {$e->getMessage()}",
                    );
                }

                usleep(500_000); // Espera 500 ms antes de reintentar
                continue;
            }
            return $this->pdo;
        }
    }
}

function obtenerConexion() {
    $type = "base";
    $db = new BaseDatos($type, 5);
    return $db->getInstance($type)->getConnection();
}

function obtenerConexionIonSmart() {
    $type = "ionsmart";
    $db = new BaseDatos($type, CONFIG["database"][$type]["timeout_seconds"]);
    return $db->getInstance($type)->getConnection();
}

function errorAlObtenerDatos($nombre_funcion, $tipo, $e = null, $setResponseCode = true) {
    $logsErrorMessage = "";
    $msg = match ($tipo) {
        "obtener" => "Obtener datos",
        "insert" => "Insertar",
        "update" => "Modificar",
        "delete" => "Eliminar",
        default => "undefined"
    };

    $logsErrorMessage .= "$msg fallido";
    $returnMessage = $logsErrorMessage;
    if ($e != null) {
        $logsErrorMessage .= " [Linea: " . $e->getLine() . "]: " . $e->getMessage();
        if (DEBUG === true || $nombre_funcion === "insertarReconocimientos") {
            $returnMessage = $logsErrorMessage;
        }
    }

    $returnObj = [
        "message" => $returnMessage,
        "error" => true
    ];

    if ($setResponseCode === true) {
        http_response_code(500);
    }

    if (
        $nombre_funcion !== "insertarReconocimientos"
    ) {
        EscribirLog(
            "ERROR en {$nombre_funcion}(): $logsErrorMessage\n",
            "error"
        );
    }

    return $returnObj;
}

function generateRandomColor() {
    return dechex(rand(0x0, 0xFFFFFF));
}

function ejecutarConsultaSQL($bd, $query, $values = [], $select = false, $getId = false) {
    if (!$bd || !$query || ($values && !is_array($values))) {
        return false;
    }

    $query = renderQuery($query);

    $sentencia = $bd->prepare($query);
    $returnData = $sentencia->execute($values);

    if ($select) {
        $resultados = $sentencia->rowCount();

        $returnData = [];
        if ($resultados) {
            $returnData = $sentencia->fetchAll();
        }
    } else if ($getId && $returnData) {
        $returnData = $bd->lastInsertId();
    }

    return $returnData;
}

function insertarDatosTabla($bd, $function_name, $nombre_tabla, $datos_tabla, $getId = false, $setErrorResponseCode = true) {
    if (!$nombre_tabla || !$datos_tabla || !is_array($datos_tabla)) return false;

    $values = [];

    $sql = "INSERT INTO {$nombre_tabla} (";
    $sqlValues = "(";
    foreach ($datos_tabla as $nombre_campo => $valor_campo) {
        if ($valor_campo) {
            $sql .= "{$nombre_campo}, ";
            $sqlValues .= "?, ";

            $values[] = $valor_campo;
        }
    }
    $sql = rtrim($sql, ", ") . ") VALUES ";

    $sql .= rtrim($sqlValues, ", ") . ")";

    try {
        if (empty($values)) {
            return false;
        }

        return ejecutarConsultaSQL($bd, $sql, $values, false, $getId);
    } catch (PDOException $e) {
        return errorAlObtenerDatos($function_name, "insert", $e, $setErrorResponseCode);
    }
}

function insertarMultiplesDatosTabla(
    $bd, 
    $function_name, 
    $nombre_tabla, 
    $datos_tabla, 
    $getId = false, 
    $setErrorResponseCode = true,
) {
    if (!$nombre_tabla || !$datos_tabla || !is_array($datos_tabla)){
        return false;
    }

    $values = [];

    $sql = "INSERT INTO {$nombre_tabla} (";
    $sqlValues = "";
    foreach ($datos_tabla as $key => $campos) {
        $sqlValues .= "(";
        $newValues = [];
        foreach ($campos as $nombre_campo => $valor_campo) {
            if ($nombre_campo && $key == 0) {
                $sql .= "{$nombre_campo}, ";
            }

            if (isset($valor_campo)) {
                $sqlValues .= "?, ";

                $newValues[] = $valor_campo;
            }
        }
        $sqlValues = rtrim($sqlValues, ", ") . "), ";
        array_push($values, ...$newValues);
    }
    $sql = rtrim($sql, ", ") . ") VALUES ";
    $sql .= rtrim($sqlValues, ", ") . ";";

    try {
        if (empty($values)) {
            return false;
        }

        return ejecutarConsultaSQL($bd, $sql, $values, false, $getId);
    } catch (PDOException $e) {
        return errorAlObtenerDatos($function_name, "insert", $e, $setErrorResponseCode);
    }
}

function modificarDatosTabla(
    $bd, 
    $function_name, 
    $nombre_tabla, 
    $datos_tabla, 
    $datos_condicionales,
) {
    if (
        !$nombre_tabla ||
            !$datos_tabla ||
            !is_array($datos_tabla) ||
            !$datos_condicionales ||
            !is_array($datos_condicionales)
    ) {
        return false;
    }

    $values = [];

    $sql = "UPDATE {$nombre_tabla} SET ";
    foreach ($datos_tabla as $nombre_campo => $valor_campo) {
        if (isset($valor_campo) && $valor_campo != "") {
            $sql .= "{$nombre_campo} = ?, ";

            if ($valor_campo === "VACIAR")
            $valor_campo = null;

            $values[] = $valor_campo;
        }
    }
    $sql = rtrim($sql, ", ") . " WHERE 1 ";

    if (empty($values)) {
        return false;
    }

    foreach ($datos_condicionales as $nombre_campo => $valor_condicion) {
        if ((is_string($valor_condicion) || is_int($valor_condicion)) && $valor_condicion != "") {
            $sql .= "AND {$nombre_campo} = ? ";

            $values[] = $valor_condicion;
        } else if (isset($valor_condicion["valor"]) && $valor_condicion["valor"] != "") {
            $operador = match ($valor_condicion["operador"]) {
                "EQ" => "=",
                "!EQ" => "!=",
                "LIKE" => "LIKE",
                "IS" => "IS",
                "IS NOT" => "IS NOT",
                default => "="
            };
            if (
                ($operador == "IS" || $operador == "IS NOT") &&
                    $valor_condicion["valor"] == "NULL"
            ) {
                $sql .= "AND {$nombre_campo} $operador NULL";
                continue;
            }

            $sql .= "AND {$nombre_campo} $operador ? ";

            $values[] = $valor_condicion["valor"];
        } else if (is_array($valor_condicion) && !empty($valor_condicion)) {
            $sql .= "AND {$nombre_campo} IN (";
            for ($i = 0; $i < count($valor_condicion); $i++) {
                $sql .= "?, ";
                $values[] = $valor_condicion[$i];
            }
            $sql = rtrim($sql, ", ") . ") ";
        } else {
            return false;
        }
    }

    try {
        return ejecutarConsultaSQL($bd, $sql, $values);
    } catch (PDOException $e) {
        return errorAlObtenerDatos($function_name, "update", $e);
    }
}

function eliminarDatosTabla(
    $bd, 
    $function_name, 
    $nombre_tabla, 
    $datos_condicionales,
) {
    if (!$nombre_tabla || !$datos_condicionales || !is_array($datos_condicionales)) {
        return false;
    }

    $values = [];

    $sql = "DELETE FROM {$nombre_tabla} WHERE 1 ";
    foreach ($datos_condicionales as $key => $condicion) {
        if (!$condicion) { continue; }

        if (is_array($condicion) && !empty($condicion)) {
            $sql .= "AND {$key} IN (";
            foreach ($condicion as $c) {
                $sql .= "?, ";
                $values[] = $c;
            }
            $sql = rtrim($sql, ", ") . ") ";
        } else {
            $sql .= "AND {$key} = ? ";
            $values[] = $condicion;
        }
    }

    if (empty($values)) return false;

    try {
        return ejecutarConsultaSQL($bd, $sql, $values);
    } catch (PDOException $e) {
        return errorAlObtenerDatos($function_name, "delete", $e);
    }
}
