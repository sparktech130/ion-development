<?php

namespace Utils;

if (!defined("FICHERO_LOGS_NX")) {
    define("FICHERO_LOGS_NX", "{$_SERVER["DOCUMENT_ROOT"]}/core/NX-API/errors.log");
}

use Exception;

class Utils
{
    public bool $DEBUG;

    public function __construct(bool $DEBUG = false)
    {
        $this->DEBUG = $DEBUG;
    }

    public static function EscribirLog($mensaje, $tipo_mensaje = "normal") {
        if (!(
            $tipo_mensaje == "error"
        )) { return; }

        error_log($mensaje, 0);
    }

    public static function acabarRequest($returnObj, $status = 200)
    {
        if (!headers_sent()) {
            header("Content-Type: application/json");
            http_response_code($status);
        }
        echo json_encode($returnObj);
        exit();
    }

    public static function generarUUID()
    {
        // Genera un UUID versión 4 (aleatorio)
        $data = openssl_random_pseudo_bytes(16);
        assert(strlen($data) == 16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf("%s%s-%s-%s-%s-%s%s%s", str_split(bin2hex($data), 4));
    }

    public static function llamadaCurlNx(
        $method = "GET",
        $URL = null,
        $postFields = [],
        $headers = [],
        $bearerToken = null,
        $user = null,
        $password = null,
        $assoc = true,
    ) {
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $URL);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

            if (isset($postFields)) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postFields));
            }

            if (is_string($headers)) {
                $headers = [$headers];
            }

            if (!isset($headers) || !is_array($headers)) {
                $headers = [];
            }

            if ($bearerToken) {
                $headers[] = "Authorization: Bearer $bearerToken";
            } else if ($user && $password) {
                curl_setopt($ch, CURLOPT_USERPWD, "$user:$password");
            }

            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 0);

            $response = curl_exec($ch);
            $response_headers = curl_getinfo($ch);
            // Manejar errores si los hubiera
            if (curl_errno($ch)) {
                Utils::EscribirLog("Error cURL en {$URL}: " . curl_error($ch), "error");
                return ["response" => ["error" => "Error al obtener datos de Nx."], "headers" => []];
            }

            curl_close($ch);

            if (!strstr($response_headers["content_type"] ?? "", "image")) {
                $response = json_decode($response, $assoc);
            }

            if ($response === null) $response = [];

            return [
                "response" => $response,
                "headers" => $response_headers,
            ];
        } catch (Exception) {
            return [];
        }
    }

    public static function getNxServer($systemId = null, $ip = null, $puerto = null)
    {
        if ($systemId != null) {
            $proxy = NX_PROXY;
            return "https://{$systemId}.{$proxy}";
        } else if (isset($ip) && isset($puerto)) {
            return "https://{$ip}:{$puerto}";
        }

        return null;
    }

    public static function loginAndGetSessionTokenNew($systemId = null, $ip = null, $puerto = null, $user = null, $password = null)
    {
        $returnObj = ["token" => null];
        $server = Utils::getNxServer($systemId, $ip, $puerto);

        if ($server === null || !isset($user) || !isset($password)) return $returnObj;

        $url = "{$server}/rest/v2/login/sessions";

        $postData = array(
            "user" => $user,
            "password" => $password,
            "setCookie" => true
        );

        // echo json_encode($postData);

        $response = Utils::llamadaCurlNx(
            "POST",
            $url,
            $postData,
            ["Content-Type: application/json"],
            null,
            $user,
            $password
        )["response"];

        if (empty($response) || isset($response["error"])) {
            return json_encode([
                "error" => "Error al iniciar sesión en el cloud: {$response["error"]}"
            ]);
        } else {
            if (isset($response["token"])) {
                return [
                    "token" => $response["token"]
                ];
            } else {
                return null;
            }
        }
    }

    public static function diferenciaSegundos($fecha_hora_ini, $fecha_hora_fin)
    {
        try {
            $diff = $fecha_hora_ini->diff($fecha_hora_fin);

            // Convert the difference to seconds
            $daysInSecs = $diff->format("%r%a") * 24 * 60 * 60;
            $hoursInSecs = $diff->h * 60 * 60;
            $minsInSecs = $diff->i * 60;
            $segundos_espera = $daysInSecs + $hoursInSecs + $minsInSecs + $diff->s;
        } catch (Exception) {
            return 0;
        }

        return $segundos_espera ?? 0;
    }

    function loginAndGetSessionToken($systemId = null, $user = null, $password = null, $server = null)
    {
        if ($server == null) {
            $server = "https://{$systemId}.relay.vmsproxy.com";
        } else {
            // var_dump($server);
            $server = "https://{$server}";
        }
        $url = "{$server}/rest/v2/login/sessions";
        // echo $url;

        $postData = array(
            "user" => $user,
            "password" => $password,
            "setCookie" => true
        );

        $response = Utils::llamadaCurlNx(
            "POST",
            $url,
            $postData,
            ["Content-Type: application/json"],
            null,
            $user,
            $password
        );
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_FAILONERROR, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_USERPWD, "$user:$password");

        $response = curl_exec($ch);

        if ($response === false) {
            $error = curl_error($ch);
            curl_close($ch);
            // print_r($error);
            return json_encode(array("error" => "Error al realizar la solicitud POST para iniciar sesión: $error"));
        } else {
            curl_close($ch);
            $responseData = json_decode($response, true);
            if (isset($responseData["token"])) {
                return json_encode(array("token" => $responseData["token"]));
            } else {
                return json_encode(array("error" => "Error: No se pudo obtener el token de autenticación."));
            }
        }
    }
}
