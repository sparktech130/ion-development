<?php

namespace Funciones;

use Dotenv\Dotenv;

require_once $_SERVER["DOCUMENT_ROOT"] . "/vendor/autoload.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/core/NX-API/utils.php";

// Variables de entorno
$ubicacion_env = $_SERVER["DOCUMENT_ROOT"];
$nombre_env = "nx.env";
$dotenv = Dotenv::createImmutable($ubicacion_env, $nombre_env);
$dotenv->safeLoad();

use Utils\Utils;
use DateTime;

class NxConnection {
    public string|null $systemId;
    public string|null $ip;
    public string|null $puerto;
    public string|null $server;
    private string|null $user;
    private string|null $password;
    private string|null $token;
    private string|null $streamAuthKey;
    public string|null $apiVersion;
    private array|null $devices;
    private DateTime|null $devicesLastRefresh = null;

    public function __construct(
        ?string $systemId = null,
        ?string $ip = null,
        ?string $puerto = null,
        ?string $user = null,
        ?string $password = null
    ) {
        $this->systemId = $systemId;
        $this->ip = $ip;
        $this->puerto = $puerto;

        $this->user = $user;
        $this->password = $password;

        $this->server = Utils::getNxServer(
            $this->systemId,
            $this->ip,
            $this->puerto
        );

        $this->token = System::loginAndGetSessionTokenNew(
            $this
        )["token"] ?? null;

        $info = System::getSystemInfo($this);

        $version = null;
        if (isset($info["version"])) {
            $version = explode(".", $info["version"])[0];
        }

        $this->apiVersion = $version >= 6 ? "v3" : "v2";
    }

    public function getStreamAuthKey(): string|null {
        return $this->streamAuthKey ?? null;
    }

    public function setStreamAuthKey(string $authKey) {
        $this->streamAuthKey = $authKey;
    }

    public function getDevices()
    {
        $fecha_hora = new DateTime();
        $fecha_hora->setTimezone(TIME_ZONE);

        if (!$this->devicesLastRefresh || Utils::diferenciaSegundos($this->devicesLastRefresh, $fecha_hora) > 300) {
            $this->devices = Devices::getDevices($this);
            $this->devicesLastRefresh = $fecha_hora;
        }
        return $this->devices;
    }

    public function getDevice($deviceId = null, $mac = null) {
        $devices = $this->getDevices();
        $deviceReturn = [];
        foreach ($devices as $d) {
            if (
                trim($d->id, "{} ") === $deviceId ||
                    $d->mac === $mac
            ) {
                $deviceReturn = $d;
                break;
            }
        }
        return $deviceReturn;
    }

    public function getDeviceThumbnail($deviceId, $time, $format, $base64 = false)
    {
        if (!$deviceId)
        return null;

        if (!$time)
        $time = time() * 1000;

        $thumbnail = Devices::getDeviceThumbnail($this, $deviceId, $time, $format ?? "jpg");
        if ($base64 === true)
        $thumbnail = base64_encode($thumbnail);
        return $thumbnail;
    }

    public function events(
        $method = "GET",
        $deviceId = null,
        $eventType = null,
        $from = null,
        $to = null,
        $limit = null
    ) {
        $server = $this->getServer();
        $token = $this->getToken();
        $cred = $this->getCredentials();

        $newURL = "{$server}/ec2/getEvents";

        $objectData = null;
        if ($method === "POST" || $method === "PATCH") {
            if ($objectData == null) {
                return ["message" => "Error al insertar datos: Datos del objeto vacíos", "error" => true];
            }

            $comprobarCampos = true;
            if ($comprobarCampos !== true) {
                return [
                    "message" => "Error al insertar datos: Campos necesarios no recibidos",
                    "error" => true,
                    "error_comprobacion" => $comprobarCampos
                ];
            }
        } else if ($method === "GET") {
            $newURL .= "?sortOrder=desc&eventsOnly=true";

            if ($deviceId != null) {
                $newURL .= "&cameraId={$deviceId}";
            }

            if ($eventType != null) {
                if (is_array($eventType) && !empty($eventType)) {
                    foreach ($eventType as $type) {
                        $newURL .= "&event_type={$type}";
                    }
                } else $newURL .= "&event_type={$eventType}";
            }

            if ($from != null) {
                $newURL .= "&from={$from}";
            }

            if ($to != null) {
                $newURL .= "&to={$to}";
            }

            if ($limit != null) {
                $newURL .= "&limit={$limit}";
            }
        }

        return Utils::llamadaCurlNx(
            method: $method,
            URL: $newURL,
            postFields: $objectData,
            bearerToken: $token,
            user: $cred["user"],
            password: $cred["password"],
        );
    }


    public function getSystemId()
    {
        return $this->systemId;
    }

    public function getServer()
    {
        return $this->server;
    }

    public function getCredentials()
    {
        return [
            "user" => $this->user,
            "password" => $this->password
        ];
    }

    public function getToken()
    {
        return $this->token;
    }

    public function getApiVersion()
    {
        return $this->apiVersion ?? "v2";
    }

    public function getServerUrl($serverId) {
        if (!$serverId || $serverId === "") {
            return null;
        }

        $serverId = trim($serverId, "{}");
        $URL = "{$this->getServer()}/rest/v3/servers/{$serverId}?_with=url";
        $credentials = $this->getCredentials();

        $r = Utils::llamadaCurlNx(
            URL: $URL,
            user: $credentials["user"],
            password: $credentials["password"],
        )["response"];

        $ex = explode("://", $r["url"] ?? "");
        return $ex[1] ?? null;
    }
}

class System
{
    public static function getSystemInfo(NxConnection $nx)
    {
        $server = $nx->getServer();
        $newURL = "{$server}/rest/v2/system/info";

        return Utils::llamadaCurlNx("GET", $newURL)["response"];
    }

    public static function getNonceToken(NxConnection $conexionNx) {
        $returnObj = ["token" => null];

        $server = $conexionNx->getServer();
        $credentials = $conexionNx->getCredentials();
        $user = $credentials["user"];
        $password = $credentials["password"];

        if ($server === null || $user == null || $password == null) {
            return $returnObj;
        }

        $authKey = $conexionNx->getStreamAuthKey();
        if ($authKey) {
            return $authKey;
        }

        $url = "{$server}/api/getNonce";

        $response = Utils::llamadaCurlNx(
            URL: $url,
            user: $user,
            password: $password
        );
        $responseData = $response["response"];

        if (!isset($responseData["reply"]["realm"]) || !isset($responseData["reply"]["nonce"])) {
            return null;
        }

        $realm = $responseData["reply"]["realm"];
        $nonce = $responseData["reply"]["nonce"];

        // Calcular el digest y las claves de autenticación
        $digest = md5("{$user}:{$realm}:{$password}");
        $partial_ha2 = md5("GET:");
        $simplified_ha2 = md5("{$digest}:{$nonce}:{$partial_ha2}");
        $authKey = base64_encode("{$user}:{$nonce}:{$simplified_ha2}");

        $conexionNx->setStreamAuthKey($authKey);

        return $authKey;

    }

    public static function loginAndGetSessionTokenNew(NxConnection $conexionNx)
    {
        $returnObj = ["token" => null];

        $server = $conexionNx->getServer();
        $credentials = $conexionNx->getCredentials();
        $user = $credentials["user"];
        $password = $credentials["password"];

        if ($server === null || $user == null || $password == null)
        return $returnObj;

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

        if (empty($response) ) {
            return json_encode([
                "error" => "Error al iniciar sesión en el cloud "
            ]);
        } else if (isset($response["error"])){
            return json_encode([
                "error" => "Error al iniciar sesión en el cloud " . $response["error"]
            ]);
        } else if (!isset($response["token"])) {
            return null;
        }

        return [
            "token" => $response["token"]
        ];
    }

    public static function crearEventoDispositivoNx(
        ?NxConnection $nx = null,
        $eventType = null, 
        $resourceId = null, 
        $recieveURL = null,
        $eventCondition = null,
        $actionParamsText = null,
        $caption = null, 
        $description = null,
    ) {
        $server = $nx->getServer();
        $token = $nx->getToken();
        $cred = $nx->getCredentials();

        if (!isset($caption)) {
            $caption = "New event for {$resourceId}";
        }

        if (!isset($description)) {
            $description = "New {$eventType} event for {$resourceId}";
        }

        $urlEventRule = "{$server}/ec2/saveEventRule";
        $recieveEventDataURL = "https://{$_ENV["ION_SERVER"]}/{$recieveURL}";

        $eventRulePostData = [
            "eventType" => $eventType,
            "eventResourceIds" => [
                $resourceId
            ],
            "eventCondition" => "",
            "eventState" => "active",
            "actionType" => "execHttpRequestAction",
            "actionResourceIds" => [],
            "eventCondition" => $eventCondition ?? "",
            "actionParams" => json_encode([
                "allUsers" => false,
                "authType" => "authBasicAndDigest",
                "durationMs" => 5000,
                "forced" => true,
                "fps" => 10,
                "needConfirmation" => false,
                "playToClient" => true,
                "recordAfter" => 0,
                "recordBeforeMs" => 1000,
                "requestType" => "",
                "streamQuality" => "highest",
                "url" => $recieveEventDataURL,
                "useSource" => false,
                "text" => $actionParamsText ?? "{\"deviceId\":\"{$resourceId}\"}",
            ]),
            "aggregationPeriod" => 2,
            "disabled" => false,
            "comment" => "{$caption}\n{$description}",
            "schedule" => "",
            "system" => true
        ];

        $saveEventRule = Utils::llamadaCurlNx(
            method: "POST",
            URL: $urlEventRule, 
            postFields: $eventRulePostData, 
            user: $cred["user"],
            password: $cred["password"],
            bearerToken: $token, 
            headers: ["Content-Type: application/json"],
        )["response"];

        return [
            "saveEventRule" => [
                "url" => $urlEventRule,
                "eventRulePostData" => $eventRulePostData,
                "success" => $saveEventRule,
            ]
        ];
    }
}

class Devices {
    public static function getDevices(NxConnection $nx)
    {
        $server = $nx->getServer();
        $token = $nx->getToken();
        $cred = $nx->getCredentials();

        $newURL = "{$server}/rest/v2/devices";

        $req = Utils::llamadaCurlNx(
            URL: $newURL, 
            bearerToken: $token,
            user: $cred["user"],
            password: $cred["password"],
            assoc: false,
        );
        return $req["response"];
    }

    public static function getDeviceThumbnail(NxConnection $nx, $deviceId, $time, $format)
    {
        $server = $nx->getServer();
        $apiVersion = $nx->getApiVersion();
        $token = $nx->getToken();
        $cred = $nx->getCredentials();

        $newURL = "{$server}/rest/{$apiVersion}/devices/{$deviceId}/image?timestampMs={$time}&rotation=10&format={$format}&tolerant=true&roundMethod=precise";

        $contentType = "Content-Type: image/" . $format;

        return Utils::llamadaCurlNx(
            "GET",
            $newURL,
            null,
            [$contentType],
            $token,
            $cred["user"],
            $cred["password"]
        )["response"];
    }

    public static function getNxStreamingUrl(
        ?NxConnection $nx = null,
        $deviceId = null,
        $pos = null,
        $endPos = null,
        $durationMs = null,
        $download = false,
    ) {
        if (!$deviceId) return false;
        $server = $nx->getServer();
        $authKey = System::getNonceToken($nx);

        $mkv_url = "{$server}/media/{$deviceId}.mkv?auth={$authKey}";
        $mp4_url = "{$server}/media/{$deviceId}.mp4?auth={$authKey}";
        if ($pos != null) {
            $mkv_url .= "&accurateSeek=true&pos=$pos";
            $mp4_url .= "&accurateSeek=true&pos=$pos";

            if ($durationMs != null) {
                $endPos = $pos + $durationMs;
            } 

            if ($endPos != null) {
                $mkv_url .= "&endPos=$endPos";
                $mp4_url .= "&endPos=$endPos";
            }
        }

        if ($download === true) {
            $mkv_url .= "&download=true";
            $mp4_url .= "&download=true";
        }

        return [ $mkv_url, $mp4_url ];
    }

    public static function obtenerTipoGrabacionMomento(
        $pos = null, 
        $device = null,
    ) {
        if (!isset($pos)) {
            return ["high", "low"];
        } else if (!$device) {
            return null;
        }

        $horario_grabacion = $device->schedule->tasks ?? [];

        if (strlen((string) $pos) > 10)
        $pos = round($pos / 1000);

        $date = new DateTime("@{$pos}");
        $date->setTimezone(TIME_ZONE);

        $dayOfWeek = (int) $date->format("N");

        $hour = (int) $date->format("G");
        $minute = (int) $date->format("i");
        $second = (int) $date->format("s");

        $segundosMomentoDia = $hour * 3600 + $minute * 60 + $second;

        if (!empty($horario_grabacion)) {
            $horario_grabacion = array_values(array_filter(
                $horario_grabacion,
                function ($day) use ($dayOfWeek, $segundosMomentoDia) {
                    return (
                        (isset($day->dayOfWeek) ? $day->dayOfWeek : 1) === $dayOfWeek &&
                            (isset($day->startTime) ? $day->startTime : 0) <= $segundosMomentoDia &&
                            $segundosMomentoDia <= $day->endTime
                    );
                }
            ));
        }

        $calidad = !empty($horario_grabacion) ?
        match ($horario_grabacion[0]->streamQuality) {
            "high", "highest" => ["high", "low"],
            default => ["low"]
        } : null;
        $tipos = !empty($horario_grabacion) && isset($horario_grabacion[0]->recordingType) ? 
        match ($horario_grabacion[0]->recordingType) {
            "always", // -> Graba siempre. 
            "metadataOnly", // -> Solo graba en movimiento.
            "metadataAndLowQuality" => $calidad,  // -> Siempre graba en low, y en high solo cuando hay movimiento.
            "never" => null,  // -> No graba nunca.
            default => null
        } : $calidad;

        return $tipos;
    }

    public static function getThisFootage(
        ?NxConnection $nx = null,
        $deviceId = null, 
        $periodType = null, 
        $startTimeMs = null, 
        $endTimeMs = null, 
        $assoc = false,
    ) {
        $server = $nx->getServer();
        $token = $nx->getToken();
        $cred = $nx->getCredentials();

        $newURL = "{$server}/rest/v2/devices/{$deviceId}/footage?periodType={$periodType}";

        if ($startTimeMs != null) {
            $newURL .= "&startTimeMs={$startTimeMs}";
        }

        if ($endTimeMs != null) {
            $newURL .= "&endTimeMs={$endTimeMs}";
        }
        $req = Utils::llamadaCurlNx(
            method: "GET",
            URL: $newURL, 
            bearerToken: $token,
            user: $cred["user"],
            password: $cred["password"],
            assoc: $assoc,
        );
        return $req["response"];
    }

    public static function recordedTimePeriods(
        ?NxConnection $nx = null,
        $deviceId = null, 
        $periodsType = null, 
        $startTimeMs = null, 
        $endTimeMs = null, 
        $coordenadas = null,
        $assoc = false,
    ) {
        $server = $nx->getServer();
        $token = $nx->getToken();
        $cred = $nx->getCredentials();

        $periodsType = match ($periodsType) {
            "analytics" => 2,
            "motion" => 1,
            default => 0
        };

        $newURL = "{$server}/ec2/recordedTimePeriods?cameraId={$deviceId}&periodsType={$periodsType}";

        if ($startTimeMs != null) {
            $newURL .= "&startTime={$startTimeMs}";
        }

        if ($endTimeMs != null) {
            $newURL .= "&endTime={$endTimeMs}";
        }

        if ($coordenadas != null) {
            if ($periodsType == 2) {
                $filtro = json_encode(["boundingBox" => $coordenadas]);
            } else if ($periodsType == 1) {
                $filtro = json_encode([[$coordenadas]]);
            }
            $filtro = urlencode($filtro);
            $newURL .= "&filter={$filtro}";
        }

        $req = Utils::llamadaCurlNx(
            method: "GET",
            URL: $newURL, 
            bearerToken: $token,
            user: $cred["user"],
            password: $cred["password"],
            assoc: $assoc,
        );
        return $req["response"];
    }

    public static function replaceDevice(
        ?NxConnection $nx = null,
        $deviceId = null,
        $deviceData = null,
    ) {
        if ($deviceId == null && ($deviceData == null)) return false;

        $server = $nx->getServer();
        $token = $nx->getToken();
        $cred = $nx->getCredentials();
        $newURL = "{$server}/rest/v2/devices/{$deviceId}";

        $req = Utils::llamadaCurlNx(
            method: "PUT",
            URL: $newURL, 
            bearerToken: $token,
            postFields: $deviceData,
            user: $cred["user"],
            password: $cred["password"],
            assoc: false,
        );
        return $req["response"];
    }

    public static function objectTrack(
        ?NxConnection $nx = null,
        $deviceId = null,
        $freeText = null,
        $startTime = null,
        $endTime = null,
        $objectTypeId = null,
        $sortOrder = "desc",
        $limit = 1,
        $x1 = null,
        $y1 = null,
        $x2 = null,
        $y2 = null,
        $assoc = true,
    ) {
        $server = $nx->getServer();
        $token = $nx->getToken();
        $cred = $nx->getCredentials();
        $newURL = "{$server}/ec2/analyticsLookupObjectTracks?deviceId=$deviceId";

        if ($freeText != null) {
            $newURL .= "&freeText=$freeText";
        }

        if ($startTime != null) {
            $newURL .= "&startTime=$startTime";
        }

        if ($endTime != null) {
            $newURL .= "&endTime=$endTime";
        }

        if ($objectTypeId != null) {
            $newURL .= "&objectTypeId=$objectTypeId";
        }

        if ($x1 != null && $y1 != null && $x2 != null && $y2 != null) {
            $newURL .= "&x1=$x1&y1=$y1&x2=$x2&y2=$y2";
        }

        if ($sortOrder != null) {
            $newURL .= "&sortOrder=$sortOrder";
        }

        if ($limit != null) {
            $newURL .= "&limit=$limit";
        }

        $req = Utils::llamadaCurlNx(
            method: "GET",
            URL: $newURL, 
            bearerToken: $token,
            user: $cred["user"],
            password: $cred["password"],
            assoc: $assoc,
        );
        return $req["response"];
    }

    public static function ptz(
        $method = "POST",
        ?NxConnection $nx = null,
        $command = null,
        $deviceId = null,
        $speedParams = null,
        $presetId = null,
        $presetName = null,
    ) {
        $objectData = [];

        $server = $nx->getServer();
        $token = $nx->getToken();
        $cred = $nx->getCredentials();

        $newURL = "{$server}/api/ptz?command={$command}&cameraId={$deviceId}";

        if (isset($presetId)) {
            $newURL .= "&presetId=" . urlencode($presetId);
        }

        if (isset($presetName)) {
            $objectData["presetName"] = $presetName;
        }

        if (isset($speedParams)) {
            if (isset($speedParams["speed"])) {
                $objectData["speed"] = $speedParams["speed"];
            } else {
                $newURL .= "&xSpeed=" . urlencode($speedParams["xSpeed"]);
                $newURL .= "&ySpeed=" . urlencode($speedParams["ySpeed"]);
                $newURL .= "&zSpeed=" . urlencode($speedParams["zSpeed"]);
            }
        }

        $req = Utils::llamadaCurlNx(
            method: $method,
            URL: $newURL, 
            bearerToken: $token,
            user: $cred["user"],
            password: $cred["password"],
            assoc: true,
        );
        return $req["response"];
    }

    public static function ptzTours(
        $method,
        ?NxConnection $nx = null,
        $command = null,
        $deviceId = null,
        $tourId = null,
    ) {
        $server = $nx->getServer();
        $token = $nx->getToken();
        $cred = $nx->getCredentials();

        $newURL = "$server/api/ptz?command={$command}&cameraId={$deviceId}";

        if (isset($tourId)) {
            $newURL .= "&tourId={$tourId}";
        }

        $req = Utils::llamadaCurlNx(
            method: $method,
            URL: $newURL, 
            postFields: null,
            bearerToken: $token,
            user: $cred["user"],
            password: $cred["password"],
            assoc: true,
        );
        return $req["response"];
    }
}

