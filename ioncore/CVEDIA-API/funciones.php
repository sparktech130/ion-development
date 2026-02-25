<?php

namespace Funciones;

require_once $_SERVER["DOCUMENT_ROOT"] . "/vendor/autoload.php";
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/CVEDIA-API/utils.php";
include_once $_SERVER["DOCUMENT_ROOT"] . "/core/consts.php";

use CVUtils\Utils;
use Exception;
use stdClass;

if (!defined("BASE_URL"))
    define("BASE_URL", $_ENV["BASE_URL"] ?? "");

if (!defined("MQTT_DATA"))
    define("MQTT_DATA", [
        "MQTT_HOST" => $_ENV["MQTT_BROKER"],
        "MQTT_PORT" => $_ENV["MQTT_PORT"],
        "MQTT_USER" => $_ENV["MQTT_USER"],
        "MQTT_PASS" => $_ENV["MQTT_PASSWORD"],
    ]);

if (!defined("AMOUNT_RUNNING_INSTANCES"))
    define("AMOUNT_RUNNING_INSTANCES", $_ENV["AMOUNT_RUNNING_INSTANCES"] ?? 1);

if (!defined("DEBUG")) {
    define("DEBUG", $_ENV["DEBUG"] ?? false);
}

class Core
{
    private Utils $Utils;

    /**
     * @param string $BASE_URL
     */
    public function __construct(public $BASE_URL)
    {
        $this->Utils = new Utils(
            DEBUG: DEBUG,
            BASE_URL: $BASE_URL,
        );
    }

    /**
     * @param mixed $any
     * @return array
     */
    private function curlCVEDIA(...$any): array
    {
        return $this->Utils->llamadaCurlCVEDIA(...$any);
    }

    /**
     * @param string $method
     * @return mixed
     */
    public function log($method = "GET")
    {
        $URL = "v1/core/log";
        $response = $this->curlCVEDIA($method, $URL);

        if (
            !isset($response["headers"]["http_code"]) ||
            (isset($response["headers"]["http_code"]) && $response["headers"]["http_code"] != 200)
        )
            return [];

        return $response["response"];
    }

    /**
     * @param string $method
     * @return mixed
     */
    public function solutions($method = "GET")
    {
        $URL = "v1/core/solutions";
        $response = $this->curlCVEDIA($method, $URL);

        if (
            !isset($response["headers"]["http_code"]) ||
            (isset($response["headers"]["http_code"]) && $response["headers"]["http_code"] != 200)
        )
            return [];

        return $response["response"];
    }

    /**
     * @param string $method
     * @return mixed
     */
    public function license_features($method = "GET")
    {
        $URL = "v1/core/license/features";
        $response = $this->curlCVEDIA($method, $URL);

        if (
            !isset($response["headers"]["http_code"]) ||
            (isset($response["headers"]["http_code"]) && $response["headers"]["http_code"] != 200)
        )
            return [];

        return $response["response"];
    }
}

class Instancia
{
    private Utils $Utils;

    /**
     * @param string $BASE_URL
     */
    public function __construct(string $BASE_URL)
    {
        $this->Utils = new Utils(
            DEBUG: DEBUG,
            BASE_URL: $BASE_URL,
        );
    }

    /**
     * @param mixed $any
     * @return array
     */
    public function curlCVEDIA(...$any): array
    {
        return $this->Utils->llamadaCurlCVEDIA(...$any);
    }

    /**
     * @param string $method
     * @return mixed
     */
    public function instances($method = "GET"): mixed
    {
        $URL = "v1/core/instances";
        $response = $this->curlCVEDIA($method, $URL);

        if (
            !isset($response["headers"]["http_code"]) ||
            (isset($response["headers"]["http_code"]) && $response["headers"]["http_code"] != 200)
        ) {
            return [];
        }

        $defaultGroups = [
            "Demos",
            "demos",
            "Persons",
            "Objects",
            "Faces",
            "Thermal",
            "Vehicles",
        ];
        return ["instances" => array_values(array_filter(
            array: $response["response"]["instances"],
            callback: function ($instance) use ($defaultGroups) {
                return !in_array($instance["group"], $defaultGroups);
            }
        ))] ?? [];
    }
    /**
     * @return array<string,array>
     */
    public function instances_running(): array
    {
        $instances = $this->instances("GET");

        // return $instances;
        return ["instances" => array_values(array_filter($instances["instances"], function ($instance) {
            return $instance["running"] === true;
        }))] ?? [];
    }

    /**
     * @param string $method
     * @param string|null $instanceId
     * @param mixed $postData
     * @return mixed
     */
    public function instance($method = "GET", $instanceId = null, $postData = null): mixed
    {
        $URL = "v1/core/instance";
        if ($instanceId) {
            $URL .= "/{$instanceId}";
        }

        $response = $this->curlCVEDIA($method, $URL, $postData);

        if ($method == "DELETE" && $response["headers"]["http_code"] != 204) {
            return false;
        } else if ($method == "DELETE" && $response["headers"]["http_code"] == 204) {
            return true;
        } else if ($method == "POST" && $response["headers"]["http_code"] != 201) {
            return [];
        } else if ($method == "PATCH" && $response["headers"]["http_code"] != 204) {
            return false;
        } else if ($method == "GET" && (
            !isset($response["headers"]["http_code"]) ||
            (isset($response["headers"]["http_code"]) && $response["headers"]["http_code"] != 200)
        ))
            return [];

        return $response["response"];
    }

    /**
     * @param string|null $instanceId
     * @param mixed $postData
     * @return mixed
     */
    public function instance_stats($instanceId = null): mixed
    {
        if (!$instanceId) {
            return [];
        }
        $URL = "v1/core/instance/{$instanceId}/statistics";
        /* $URL = "v1/securt/instance/{$instanceId}/stats"; */

        $response = $this->curlCVEDIA("GET", $URL, null, ["Accept: application/json"]);

        return $response["response"];
    }

    /**
     * @param string $method
     * @param string|null $instanceId
     * @return array|<missing>
     */
    public function instance_events($method = "GET", $instanceId = null): mixed
    {
        $URL = "v1/core/instance/{$instanceId}/consume_events";
        $response = $this->curlCVEDIA($method, $URL);

        if (
            !isset($response["headers"]["http_code"]) ||
            (isset($response["headers"]["http_code"]) && $response["headers"]["http_code"] != 200)
        )
            return [];

        return $response["response"];
    }

    public function lpr($instanceId, $action = "get"): mixed
    {
        $URL = "v1/securt/instance/{$instanceId}/lpr";
        [$method, $data] = match (strtolower($action)) {
            "enable" => ["POST", ["enable" => true]],
            "disable" => ["POST", ["enable" => false]],
            "get" => ["GET", null],
            default => ["GET", null],
        };

        $response = $this->curlCVEDIA(
            $method,
            $URL,
            $data,
            ["Content-Type: application/json"],
        );

        if (
            !isset($response["headers"]["http_code"]) ||
            (
                isset($response["headers"]["http_code"]) &&
                $response["headers"]["http_code"] != 200 &&
                $response["headers"]["http_code"] != 204
            )
        ) {
            return [];
        }

        if ($response["headers"]["http_code"] == 204) {
            return true;
        }

        return $response["response"];
    }

    /**
     * @param string|null $instanceId
     * @param mixed $body
     * @return bool
     */
    public function setOutputConfig($instanceId, $body): bool
    {
        if (!$instanceId || !$body)
            return false;

        $config_route = "Output";

        $config_data = $this->prepare_instance_config("{$config_route}", $body);
        $this->instance_config("POST", $instanceId, $config_data);
        return true;
    }

    /**
     * @param string|null $instanceId
     * @param mixed $body
     * @return bool
     */
    public function setupMqttPlugin($instanceId, $body): bool
    {
        if (!$instanceId || !$body)
            return false;

        $config_route = "MQTT";

        $config_data = $this->prepare_instance_config("{$config_route}", $body);
        $this->instance_config("POST", $instanceId, $config_data);
        return true;
    }

    /**
     * @param string|null $instanceId
     * @param mixed $analytics
     * @return bool
     */
    public function setAnalyticsType($instanceId, $analytics): bool
    {
        if (!$instanceId || !is_array($analytics))
            return false;

        $config_route = "Analytics";

        $config_data = $this->prepare_instance_config("{$config_route}", $analytics);
        $this->instance_config("POST", $instanceId, $config_data);
        return true;
    }

    /**
     * @param string|null $instanceId
     * @param mixed $counting
     * @return bool
     */
    public function setCounting($instanceId, $counting): bool
    {
        if (!$instanceId || !is_array($counting))
            return false;

        $config_route = "Counting";

        $config_data = $this->prepare_instance_config("{$config_route}", $counting);
        $this->instance_config("POST", $instanceId, $config_data);
        return true;
    }

    /**
     * @param string|null $instanceId
     * @param mixed $campos
     * @return bool|array
     */
    public function ponerCamposVaciosConfig($instanceId, $campos): bool|array
    {
        if (!$instanceId || !is_array($campos))
            return false;

        $return = [];
        foreach ($campos as $c) {
            $config_route = $c;

            $config_data = $this->prepare_instance_config("{$config_route}", new stdClass);
            $return[] = $this->instance_config("POST", $instanceId, $config_data);
        }
        return $return;
    }

    /**
     * @param string|null $instanceId
     * @param mixed $areaId
     * @param mixed $areaType
     * @return bool
     */
    public function setIonAreaType($instanceId, $areaId, $areaType): bool
    {
        if (!$instanceId || !$areaId || !$areaType)
            return false;

        $config_data = $this->prepare_instance_config("Zone/Zones/{$areaId}/ion_type", $areaType);
        $this->instance_config("POST", $instanceId, $config_data);
        return true;
    }

    /**
     * @param string|null $instanceId
     * @param mixed $lineId
     * @param mixed $lineType
     * @return bool
     */
    public function setIonLineType($instanceId, $lineId, $lineType): bool
    {
        if (!$instanceId || !$lineId || !$lineType)
            return false;

        $config_data = $this->prepare_instance_config("Tripwire/Tripwires/{$lineId}/ion_type", $lineType);
        $this->instance_config("POST", $instanceId, $config_data);
        return true;
    }

    /**
     * @param string|null $instanceId
     * @param mixed $zoneId
     * @param mixed $zoneType
     * @param mixed $cod_infraccion
     * @return bool
     */
    public function setCodInfraccion($instanceId, $zoneId, $zoneType, $cod_infraccion): bool
    {
        if (!$instanceId || !$zoneType || !$zoneId || !$cod_infraccion)
            return false;

        $config_route = match ($zoneType) {
            "area" => "Zone/Zones",
            "line" => "Tripwire/Tripwires",
            default => null
        };

        if (!$config_route)
            return false;

        $config_data = $this->prepare_instance_config("{$config_route}/{$zoneId}/cod_infraccion", $cod_infraccion);
        $this->instance_config("POST", $instanceId, $config_data);
        return true;
    }

    /**
     * @param string|null $instanceId
     * @param mixed $zoneId
     * @param mixed $zoneType
     * @param mixed $ionZoneType
     * @return bool
     */
    public function setIonZoneType($instanceId, $zoneId, $zoneType, $ionZoneType): bool
    {
        if (!$instanceId || !$zoneType || !$zoneId || !$ionZoneType)
            return false;

        $config_route = match ($zoneType) {
            "area" => "Zone/Zones",
            "line" => "Tripwire/Tripwires",
            default => null
        };

        if (!$config_route)
            return false;

        $config_data = $this->prepare_instance_config("{$config_route}/{$zoneId}/ion_zone_type", $ionZoneType);
        $this->instance_config("POST", $instanceId, $config_data);
        return true;
    }

    /**
     * @param string|null $instanceId
     * @param mixed $zoneId
     * @param mixed $zoneType
     * @return bool
     */
    public function setFaceClass($instanceId, $zoneId, $zoneType): bool
    {
        if (!$instanceId || !$zoneType || !$zoneId)
            return false;

        $config_route = match ($zoneType) {
            "area" => "Zone/Zones",
            "line" => "Tripwire/Tripwires",
            default => null
        };

        if (!$config_route)
            return false;

        $config_data = $this->prepare_instance_config("{$config_route}/{$zoneId}/detect_faces", true);
        $this->instance_config("POST", $instanceId, $config_data);
        return true;
    }

    /**
     * @param mixed $path
     * @param mixed $jsonValue
     * @param mixed $esObjetoVacio
     * @return bool|array<string,mixed>
     */
    public function prepare_instance_config($path = null, $jsonValue = null, $esObjetoVacio = false): bool|array
    {
        if (!$path || !$jsonValue)
            return false;

        $value = is_string($jsonValue) ? "\"$jsonValue\"" : json_encode($jsonValue);

        if ($esObjetoVacio) {
            $value = $jsonValue;
        }

        return [
            "path" => $path,
            "jsonValue" => $value
        ];
    }

    /**
     * @param mixed $method
     * @param string|null $instanceId
     * @param mixed $arrayDatos
     * @return mixed
     */
    public function instance_config($method = "GET", $instanceId = null, $arrayDatos = []): mixed
    {
        $URL = "v1/core/instance/{$instanceId}/config";
        $response = $this->curlCVEDIA(
            $method,
            $URL,
            $method === "POST" ? $arrayDatos : null,
        );

        if ($method === "POST") {
            return $response;
        }

        if ($response["headers"]["http_code"] != 200 && $response["headers"]["http_code"] != 204)
            return [];

        return $response["response"];
    }

    /**
     * @param string|null $instanceId
     * @param mixed $uri
     * @param mixed $type
     * @return bool|array<int,mixed>
     */
    public function instance_input($instanceId, $uri, $type): bool|array
    {
        if (!$instanceId || !$uri || !$type)
            return false;

        $URL = "v1/core/instance/{$instanceId}/input";
        $postData = [
            "type" => $type,
            "uri" => $uri
        ];

        $response = $this->curlCVEDIA(
            "POST",
            $URL,
            $postData
        );

        if (
            $response["headers"]["http_code"] != 200 &&
            $response["headers"]["http_code"] != 204
        )
            return [$postData, $response];

        return true;
    }

    /**
     * @param string|null $instanceId
     * @param mixed $mode ["Both", "Vehicles", "Person", "Off"]
     * @return bool|mixed
     */
    public function instance_attributes($method = "GET", $instanceId = null, $mode = "Both"): mixed
    {
        if (!$instanceId || !$mode)
            return false;

        $URL = "v1/securt/instance/{$instanceId}/attributes_extraction";
        $postData = null;
        if ($method != "GET") {
            $postData = [
                "mode" => $mode
            ];
        }

        $response = $this->curlCVEDIA(
            $method,
            $URL,
            $postData
        );

        return $response["response"];
    }

    /**
     * @param string|null $instanceId
     * @param mixed $zoneId
     * @param mixed $attribute_restrictions
     * @param mixed $zoneType
     * @return bool
     */
    public function update_zone_attributes(
        $instanceId,
        $zoneId,
        $attribute_restrictions,
        $zoneType  // "area" or "line"
    ): bool {
        $config_route = match ($zoneType) {
            "area" => "Zone/Zones",
            "line" => "Tripwire/Tripwires",
            default => null
        };

        if (empty($attribute_restrictions) || !$config_route) {
            return false;
        }

        if ($zoneType === "area") {
            $a = new Area($this);

            $zone = $a->obtener_areas_full($instanceId, $zoneId);
        } else {
            $l = new Line($this);

            $zone = $l->obtener_lines_full($instanceId, $zoneId);
        }

        $zone_attributes_config_old = $zone["additionalConfig"]["attribute_restrictions"] ?? [];
        $zone_attributes_values_old = $zone["additionalConfig"]["attribute_restrictions_values"] ?? [];

        $attribute_restrictions_config = [];
        $attribute_restrictions_values = [];

        $possibleAttributes = [
            "lower_clothing_color",
            "person_carrying_gun",
            "person_fallen",
            "upper_clothing_color"
        ];

        foreach ($attribute_restrictions as $key => $attribute) {
            if ($attribute !== false) {
                $attribute_restrictions_values[$key] = $attribute;
            }
            $attribute_restrictions_config[$key] = $attribute !== false;
        }

        foreach ($possibleAttributes as $attr) {
            if (!isset($attribute_restrictions_config[$attr])) {
                $attribute_restrictions_config[$attr] = false;

                if ($attr == "person_carrying_gun" || $attr = "person_fallen") {
                    $attribute_restrictions_config[$attr] = $zone_attributes_config_old[$attr] ?? false;
                    if (isset($zone_attributes_values_old[$attr]))
                        $attribute_restrictions_values[$attr] = $zone_attributes_values_old[$attr];
                }
            }
        }

        $config_data = $this->prepare_instance_config("{$config_route}/{$zoneId}/attribute_restrictions", $attribute_restrictions_config);
        $this->instance_config("POST", $instanceId, $config_data);

        $config_data = $this->prepare_instance_config("{$config_route}/{$zoneId}/attribute_restrictions_values", $attribute_restrictions_values);
        $this->instance_config("POST", $instanceId, $config_data);

        return true;
    }

    /**
     * @param mixed $method
     * @param string|null $instanceId
     * @return mixed
     */
    public function instance_state($method = "GET", $instanceId = null): mixed
    {
        $URL = "v1/core/instance/{$instanceId}/state";
        $response = $this->curlCVEDIA($method, $URL);

        if ($response["headers"]["http_code"] != 200)
            return [];

        // return $response;
        return $response["response"];
    }

    /**
     * @param mixed $method
     * @param string|null $instanceId
     * @return mixed
     */
    public function instance_frame($method = "GET", $instanceId = null): mixed
    {
        $URL = "v1/core/instance/{$instanceId}/frame";
        $response = $this->curlCVEDIA($method, $URL);

        if ($response["headers"]["http_code"] != 200)
            return [];

        return $response["response"];
    }

    /**
     * @param string|null $instanceId
     * @return bool
     */
    public function instance_start($instanceId = null): bool
    {
        if (!$instanceId)
            return false;
        /* $running_instances = $this->instances_running(); */
        /* $running_instances = count($running_instances["instances"] ?? []); */

        $URL = "v1/core/instance/{$instanceId}/start";
        $response = $this->curlCVEDIA("POST", $URL);

        if ($response["headers"]["http_code"] != 204)
            return false;

        return true;
    }

    /**
     * @param string|null $instanceId
     * @return bool
     */
    public function instance_restart($instanceId): bool
    {
        if (!$instanceId)
            return false;

        $instance = $this->instance("GET", $instanceId);
        if (isset($instance["running"]) && $instance["running"] === true) {
            $URL = "v1/core/instance/{$instanceId}/restart";
            $response = $this->curlCVEDIA("POST", $URL);
            if ($response["headers"]["http_code"] != 204)
                return false;

            return true;
        }
        return false;
    }

    /**
     * @param string|null $instanceId
     * @return bool
     */
    public function instance_stop($instanceId = null): bool
    {
        if (!$instanceId)
            return false;

        $URL = "v1/core/instance/{$instanceId}/stop";
        $response = $this->curlCVEDIA("POST", $URL);

        if ($response["headers"]["http_code"] != 204)
            return false;

        return true;
    }

    /**
     * @param string|null $instanceId
     * @return bool
     */
    public function instance_load($instanceId = null): bool
    {
        if (!$instanceId)
            return false;

        $URL = "v1/core/instance/{$instanceId}/load";
        $response = $this->curlCVEDIA("POST", $URL);

        if ($response["headers"]["http_code"] != 204)
            return false;
        return true;
    }

    /**
     * @param string|null $instanceId
     * @return bool
     */
    public function instance_unload($instanceId = null): bool
    {
        if (!$instanceId)
            return false;

        $URL = "v1/core/instance/{$instanceId}/unload";
        $response = $this->curlCVEDIA("POST", $URL);

        if ($response["headers"]["http_code"] != 204)
            return false;
        return true;
    }
}

class Area
{
    private Instancia $Instance;
    public Instancia $instance;

    /**
     * @param Instancia $instance
     */
    public function __construct(Instancia $instance)
    {
        $this->Instance = $instance;
        $this->instance = $instance;
    }

    /**
     * @param mixed $any
     * @return array
     */
    private function curlCVEDIA(...$any): array
    {
        return $this->Instance->curlCVEDIA(...$any);
    }

    /**
     * @param string|null $instanceId
     * @param mixed $areaId
     * @return mixed
     */
    public function obtener_area($instanceId, $areaId): mixed
    {
        $areas = $this->obtener_areas($instanceId);
        foreach ($areas as $areaType) {
            foreach ($areaType as $a) {
                if ($a["id"] == $areaId) {
                    return $a;
                }
            }
        }
        return [];
    }

    /**
     * @param string|null $instanceId
     * @param mixed $areaId
     * @return mixed
     */
    public function obtener_areas_full($instanceId, $areaId = null): mixed
    {
        $instance_config = $this->Instance->instance_config("GET", $instanceId);
        $zonasConfig = [];
        $areas = [];

        if (!empty($instance_config)) {
            $zonasConfig = $instance_config["Zone"]["Zones"] ?? [];
        }
        $areaReturn = null;

        $areas = $this->obtener_areas($instanceId);
        foreach ($areas as $key => $areaType) {
            foreach ($areaType as $ind => $a) {
                if (isset($a["id"])) {
                    $newConf = $zonasConfig[$a["id"]];

                    if (isset($newConf["color"]))
                        unset($newConf["color"]);

                    if (isset($newConf["vertices"]))
                        unset($newConf["vertices"]);

                    if (isset($newConf["id"]))
                        unset($newConf["id"]);

                    if (isset($newConf["name"]))
                        unset($newConf["name"]);

                    if (isset($newConf["left_duration"]) && $newConf["ion_type"] === "object_left")
                        $areas[$key][$ind]["seconds"] = $newConf["left_duration"];
                    else if (isset($newConf["removed_duration"]) && $newConf["ion_type"] === "object_removed")
                        $areas[$key][$ind]["seconds"] = $newConf["removed_duration"];

                    $areas[$key][$ind]["additionalConfig"] = $newConf ?? [];

                    if (isset($areaId) && $a["id"] == $areaId)
                        $areaReturn = $areas[$key][$ind];
                }
            }
        }

        return isset($areaReturn) ? $areaReturn : $areas;
    }

    /**
     * @param string|null $instanceId
     * @return mixed
     */
    public function obtener_areas($instanceId): mixed
    {
        // $postData=[$instanceId,$areaId,$coordinates];
        $URL = "v1/securt/instance/{$instanceId}/areas";

        $response = $this->curlCVEDIA("GET", $URL, $instanceId);

        return $response["response"];
    }

    /**
     * @param string $method
     * @param mixed $type
     * @param string|null $instanceId
     * @param mixed $areaId
     * @param mixed $postData
     * @return mixed
     */
    public function area(
        $method,
        $type,
        $instanceId,
        $areaId,
        $postData
    ): mixed {
        if (!$instanceId)
            return false;

        $URL = "v1/securt/instance/{$instanceId}/area/{$type}";

        if ($areaId) {
            $URL .= "/{$areaId}";
        }
        $response = $this->curlCVEDIA($method, $URL, $postData);

        if (
            $response["headers"]["http_code"] == 400 ||
            $response["headers"]["http_code"] == 404
        )
            return false;

        return $method == "PUT" &&
            ($response["headers"]["http_code"] != 201 || $response["headers"]["http_code"] != 200)
            ? true
            : $response["response"];
    }

    /**
     * @param mixed $method
     * @param string|null $instanceId
     * @param mixed $areaId
     * @param mixed $zoneData
     * @return bool|array
     */
    public function area_crowdest(
        $method,
        $instanceId,
        $areaId,
        $zoneData = null
    ): bool|array {
        if (
            !isset($instanceId) ||
            !isset($areaId) ||
            (
                (
                    $method != "DELETE" &&
                    $method != "GET"
                ) && (
                    !isset($zoneData["name"]) ||
                    !isset($zoneData["vertices"]) ||
                    !isset($zoneData["color"])
                )
            )
        )
            return false;

        try {
            $config = $this->Instance->instance_config("GET", $instanceId);
            $areas = [];
            if (isset($config["Zone"]["Zones"]))
                $areas = $config["Zone"]["Zones"];

            if ($method === "GET") {
                return $areas[$areaId] ?? [];
            } elseif ($method === "POST") {
                $config_data = $this->Instance->prepare_instance_config("Zone/Zones/{$areaId}", $zoneData);
                $this->Instance->instance_config("POST", $instanceId, $config_data);
            } else if ($method === "PUT") {
                if (!isset($areas[$areaId]))
                    return false;

                $areas[$areaId] = $zoneData;

                $config_data = $this->Instance->prepare_instance_config("Zone/Zones/{$areaId}", $zoneData);
                $this->Instance->instance_config("POST", $instanceId, $config_data);
            } else if ($method === "DELETE") {
                unset($areas[$areaId]);

                $config_data = $this->Instance->prepare_instance_config("Zone/Zones", $areas);
                $this->Instance->instance_config("POST", $instanceId, $config_data);
            }
        } catch (Exception $e) {
            throw $e;
            return false;
        }
        return true;
    }

    /**
     * @param string|null $instanceId
     * @param mixed $areaId
     * @return mixed
     */
    public function delete_area($instanceId, $areaId): mixed
    {
        if (!$instanceId || !$areaId)
            return false;

        $instancia = $this->Instance->instance("GET", $instanceId);

        if (empty($instancia))
            return false;
        else if ($instancia["solutionId"] === "crowd-estimation") {
            return $this->area_crowdest("DELETE", $instanceId, $areaId);
        }

        $URL = "v1/securt/instance/{$instanceId}/area";

        $postData = [];

        if ($areaId) {
            $URL .= "/{$areaId}";
        }
        $response = $this->curlCVEDIA("DELETE", $URL, $postData);

        if (
            $response["headers"]["http_code"] == 400 ||
            $response["headers"]["http_code"] == 404
        )
            return false;

        return true;
    }
}

class Line
{
    private Instancia $Instance;
    public Instancia $instance;

    /**
     * @param Instancia $instance
     */
    public function __construct(Instancia $instance)
    {
        $this->Instance = $instance;
        $this->instance = $instance;
    }

    /**
     * @param mixed $any
     * @return array
     */
    private function curlCVEDIA(...$any): array
    {
        return $this->Instance->curlCVEDIA(...$any);
    }
    /**
     * @param string|null $instanceId
     * @return mixed
     */
    public function obtener_lines($instanceId): mixed
    {
        $URL = "v1/securt/instance/{$instanceId}/lines";

        $response = $this->curlCVEDIA("GET", $URL, $instanceId);

        if ($response["headers"]["http_code"] != 200)
            return false;

        return $response["response"];
    }
    /**
     * @param string|null $instanceId
     * @param mixed $lineId
     * @return mixed
     */
    public function obtener_lines_full($instanceId, $lineId = null, $dbZones = null): mixed
    {
        $instance_config = $this->Instance->instance_config("GET", $instanceId);
        $zonasConfig = [];
        $lines = [];

        if (!empty($instance_config)) {
            $zonasConfig = $instance_config["Tripwire"]["Tripwires"] ?? [];
        }

        $lines = $this->obtener_lines($instanceId);
        if (is_array($lines))
            foreach ($lines as $key => $areaType) {
                foreach ($areaType as $ind => $a) {
                    $newConf = $zonasConfig[$a["id"]];

                    if (isset($newConf["color"]))
                        unset($newConf["color"]);

                    if (isset($newConf["vertices"]))
                        unset($newConf["vertices"]);

                    if (isset($newConf["id"]))
                        unset($newConf["id"]);

                    if (isset($newConf["name"]))
                        unset($newConf["name"]);

                    if (!isset($newConf["ion_type"])) {
                        $newConf["ion_type"] = $dbZones[$a["id"]]->ion_type;
                    }

                    if (!isset($newConf["ion_zone_type"])) {
                        $newConf["ion_zone_type"] = $dbZones[$a["id"]]->cod_tipo_area ?? null;
                    }

                    if (!isset($newConf["cod_infraccion"])) {
                        $newConf["cod_infraccion"] = $dbZones[$a["id"]]->cod_infraccion ?? null;
                    }

                    $lines[$key][$ind]["additionalConfig"] = $newConf ?? [];
                }
            }

        // Para añadir zonas Tailgating, que no salen
        foreach ($zonasConfig as $zone) {
            if (isset($zone["ion_type"]) && $zone["ion_type"] === "line_tailgating") {
                $newConf = $zone;

                $classes = [];
                if ($zone["detect_people"])
                    $classes[] = "Person";
                if ($zone["detect_animals"])
                    $classes[] = "Animal";
                if ($zone["detect_vehicles"])
                    $classes[] = "Vehicle";
                if ($zone["detect_faces"])
                    $classes[] = "Face";
                if ($zone["detect_unknowns"])
                    $classes[] = "Unknown";

                $zoneAdd = [
                    "classes" => $classes,
                    "color" => $zone["color"],
                    "coordinates" => $zone["vertices"],
                    "direction" => $zone["direction"],
                    "id" => $zone["id"],
                    "name" => $zone["name"],
                    "type" => $zone["groupby"],
                    "seconds" => $zone["tailgating_maximum_crossing_elapsed"] ?? null
                ];

                if (isset($newConf["color"]))
                    unset($newConf["color"]);

                if (isset($newConf["vertices"]))
                    unset($newConf["vertices"]);

                if (isset($newConf["id"]))
                    unset($newConf["id"]);

                if (isset($newConf["name"]))
                    unset($newConf["name"]);

                if (isset($newConf["tailgating_maximum_crossing_elapsed"]))
                    unset($newConf["tailgating_maximum_crossing_elapsed"]);

                $zoneAdd["additionalConfig"] = $newConf;

                $lines["crossingLines"][] = $zoneAdd;
            }
        }

        if (isset($lineId)) {
            $resultado = array_filter($lines["crossingLines"], function ($line) use ($lineId) {
                return $line["id"] === $lineId;
            });
            if (empty($resultado))
                return [];
            else
                return $resultado;
        }
        return $lines;
    }
    /**
     * @param mixed $method
     * @param mixed $type
     * @param string|null $instanceId
     * @param mixed $lineId
     * @param mixed $postData
     * @return mixed
     */
    public function line(
        $method,
        $type,
        $instanceId,
        $lineId,
        $postData = null
    ): mixed {
        if (!$instanceId)
            return false;

        $URL = "v1/securt/instance/{$instanceId}/line";

        if ($method != "DELETE")
            $URL .= "/{$type}";

        if ($lineId && $method != "POST") {
            $URL .= "/{$lineId}";
        }

        $response = $this->curlCVEDIA($method, $URL, $postData);

        if (
            $response["headers"]["http_code"] == 400 ||
            $response["headers"]["http_code"] == 404
        )
            return false;

        return $method == "PUT" ? true : $response["response"];
    }
    /**
     * @param string|null $instanceId
     * @param mixed $lineId
     * @return bool
     */
    public function delete_line($instanceId, $lineId): bool
    {
        if (!$instanceId || !$lineId)
            return false;

        $URL = "v1/securt/instance/{$instanceId}/line";

        $postData = [];

        if ($lineId) {
            $URL .= "/{$lineId}";
        }
        $response = $this->curlCVEDIA("DELETE", $URL, $postData);

        if (
            $response["headers"]["http_code"] == 400 ||
            $response["headers"]["http_code"] == 404
        )
            return false;

        return true;
    }
}
