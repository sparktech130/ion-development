<?php

namespace CVUtils;

if (!defined("FICHERO_LOGS_CVEDIA")) {
    define("FICHERO_LOGS_CVEDIA", "{$_SERVER["DOCUMENT_ROOT"]}/core/CVEDIA-API/cvedia_errors.log");
}

use Exception;

class Utils
{
    public bool $DEBUG;
    private string $BASE_URL;

    public function __construct(
        ?bool $DEBUG = null,
        ?string $BASE_URL = null,
    ) {
        $this->DEBUG = $DEBUG;
        $this->BASE_URL = $BASE_URL;
    }

    public function setBaseURL(string $URL): void {
        $this->BASE_URL = $URL;
    }

    public function getBaseURL(): string {
        return $this->BASE_URL;
    }

    /**
     * @param mixed $mensaje
     * @param mixed $tipo_mensaje
     */
    public static function EscribirLog($mensaje, $tipo_mensaje = "normal"): void {
        if (!(
            $tipo_mensaje == "error"
        )) { return; }

        error_log($mensaje, 0);
    }

    /**
     * @param mixed $returnObj
     * @param mixed $status
     */
    public static function acabarRequest($returnObj, $status = 200): void
    {
        ob_clean();
        if (!headers_sent()) {
            header("Content-Type: application/json");
            http_response_code($status);
        }
        echo json_encode($returnObj, JSON_PRETTY_PRINT);
        exit();
    }

    public static function generarUUID(): string
    {
        // Genera un UUID versión 4 (aleatorio)
        $data = openssl_random_pseudo_bytes(16);
        assert(strlen($data) == 16);
        $data[6] = chr(ord($data[6]) & 0xF | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3F | 0x80);
        return vsprintf("%s%s-%s-%s-%s-%s%s%s", str_split(bin2hex($data), 4));
    }

    /**
     * @param mixed $method
     * @param mixed $URL
     * @param mixed $postFields
     * @param mixed $headers
     * @return array
     */
    public function llamadaCurlCVEDIA($method = "GET", $URL = null, $postFields = [], $headers = []): array
    {
        try {
            $URL = "{$this->getBaseURL()}/{$URL}";

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $URL);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

            if (isset($postFields))
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postFields));

            if (is_array($headers)) {
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            } else if (is_string($headers)) {
                curl_setopt($ch, CURLOPT_HTTPHEADER, [$headers]);
            }
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 0);

            $response = curl_exec($ch);
            // Manejar errores si los hubiera
            if (curl_errno($ch)) {
                Utils::EscribirLog("Error cURL: " . curl_error($ch), "error");
                return ["error" => "Error cURL", "headers" => []];
            }

            curl_close($ch);
            $response = json_decode($response, true);
            if ($response === null)
                $response = [];

            return [
                "response" => $response,
                "headers" => curl_getinfo($ch)
            ];
        } catch (Exception) {
            return [];
        }
    }

    /**
     * @param mixed $ip
     * @param mixed $puerto
     * @return string
     */
    public static function obtenerServer($ip = null, $puerto = null): string
    {
        if ($ip != null && $puerto != null) {
            return "http://{$ip}:{$puerto}";
        }

        return BASE_URL;
    }
}
