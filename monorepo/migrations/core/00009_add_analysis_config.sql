-- +goose Up
CREATE TABLE IF NOT EXISTS `analysis_cloud` (
  `cod_cloud_analysis` int(3) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `nombre_cloud` varchar(200) NOT NULL,
  `ip` varchar(20) NOT NULL,
  `puerto` varchar(6) NOT NULL,
  `canales` int(3) NOT NULL,
  `activo` tinyint(1) NOT NULL,

  PRIMARY KEY (`cod_cloud_analysis`),
  UNIQUE KEY `ip_puerto` (`ip`,`puerto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `analysis_cloud_instancias` (
  `instanceId` varchar(36) NOT NULL,
  `solution_code` enum('securt','crowd-estimation') NOT NULL,
  `ALPR` tinyint(1) NOT NULL,
  `cod_dispositivo` int(6) UNSIGNED ZEROFILL NOT NULL,
  `cod_cloud_analysis` int(3) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`instanceId`),
  UNIQUE KEY `instancia_cloud` (`solution_code`,`cod_dispositivo`,`cod_cloud_analysis`),
  KEY `cod_dispositivo` (`cod_dispositivo`),

  FOREIGN KEY (`cod_dispositivo`) REFERENCES `dispositivos` (`cod_dispositivo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `analysis_tipo_area` (
  `cod_tipo_area` int(4) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `desc_tipo_area` varchar(50) NOT NULL,
  `cod_modulo` int(4) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_alertagest` int(4) UNSIGNED ZEROFILL DEFAULT NULL,

  PRIMARY KEY (`cod_tipo_area`),
  KEY `cod_modulo` (`cod_modulo`),

  FOREIGN KEY (`cod_modulo`) REFERENCES `modulos` (`cod_modulo`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `analysis_modulos` (
  `cod_rel` int(5) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `cod_ai` int(4) UNSIGNED ZEROFILL NOT NULL,
  `cod_modulo` int(4) UNSIGNED ZEROFILL NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `cod_tipo_area` int(4) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_categoria` int(4) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`cod_rel`),
  KEY `cod_ai` (`cod_ai`),
  KEY `cod_modulo` (`cod_modulo`),
  KEY `cod_tipo_area` (`cod_tipo_area`),
  KEY `cod_categoria` (`cod_categoria`),

  FOREIGN KEY (`cod_ai`) REFERENCES `analysis` (`cod_ai`) ON DELETE CASCADE,
  FOREIGN KEY (`cod_modulo`) REFERENCES `modulos` (`cod_modulo`) ON DELETE CASCADE,
  FOREIGN KEY (`cod_tipo_area`) REFERENCES `analysis_tipo_area` (`cod_tipo_area`) ON DELETE SET NULL,
  FOREIGN KEY (`cod_categoria`) REFERENCES `fabricantes_categoria` (`cod_categoria`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `analysis_zona_deteccion` (
  `zoneId` varchar(36) NOT NULL,
  `cod_dispositivo` int(10) UNSIGNED ZEROFILL NOT NULL,
  `instanceId` char(36) NOT NULL,
  `cod_tipo_area` int(4) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_ai` int(4) UNSIGNED ZEROFILL NOT NULL,
  `solution` enum('crowd-estimation','securt') NOT NULL DEFAULT 'securt',
  `cod_infraccion` varchar(15) DEFAULT NULL,
  `extra_data` text DEFAULT NULL,

  PRIMARY KEY (`zoneId`),
  KEY `cod_tipo_area` (`cod_tipo_area`),
  KEY `cod_ai` (`cod_ai`),
  KEY `analysis_zona_deteccion_ibfk_2` (`instanceId`),

  FOREIGN KEY (`cod_tipo_area`) REFERENCES `analysis_tipo_area` (`cod_tipo_area`) ON DELETE CASCADE,
  FOREIGN KEY (`instanceId`) REFERENCES `analysis_cloud_instancias` (`instanceId`) ON DELETE CASCADE,
  FOREIGN KEY (`cod_ai`) REFERENCES `analysis` (`cod_ai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `analysis_ocupacion` (
  `cod_log_ocupacion` int(11) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `fecha_hora` datetime NOT NULL,
  `ocupacion` int(9) NOT NULL,
  `cod_dispositivo` int(6) UNSIGNED ZEROFILL NOT NULL,
  `zoneId` varchar(36) DEFAULT NULL,
  `movement` enum('entrada','salida') DEFAULT NULL,

  PRIMARY KEY (`cod_log_ocupacion`),
  KEY `cod_dispositivo` (`cod_dispositivo`),
  KEY `zoneId` (`zoneId`),

  FOREIGN KEY (`cod_dispositivo`) REFERENCES `dispositivos` (`cod_dispositivo`) ON DELETE CASCADE,
  FOREIGN KEY (`zoneId`) REFERENCES `analysis_zona_deteccion` (`zoneId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;


-- +goose Down

DROP TABLE IF EXISTS IF EXISTS `analysis_ocupacion`;
DROP TABLE IF EXISTS IF EXISTS `analysis_zona_deteccion`;
DROP TABLE IF EXISTS IF EXISTS `analysis_modulos`;
DROP TABLE IF EXISTS IF EXISTS `analysis_tipo_area`;
DROP TABLE IF EXISTS IF EXISTS `analysis_cloud_instancias`;
DROP TABLE IF EXISTS IF EXISTS `analysis_cloud`;

