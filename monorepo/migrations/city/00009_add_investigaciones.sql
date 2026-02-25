-- +goose envsub on

-- +goose Up
CREATE TABLE IF NOT EXISTS `investigacion` (
  `cod_investigacion` int(6) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `nombre_investigacion` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `coordenadas` varchar(300) NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `fecha_hora_ini` datetime NOT NULL,
  `fecha_hora_fin` datetime DEFAULT NULL,
  `cod_usuario` int(6) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`cod_investigacion`),
  KEY `cod_usuario` (`cod_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `investigacion_dispositivo` (
  `cod_inv_disp` int(8) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `cod_investigacion` int(6) UNSIGNED ZEROFILL NOT NULL,
  `cod_dispositivo` int(6) UNSIGNED ZEROFILL NOT NULL,
  `fecha_hora_ini` datetime NOT NULL,
  `fecha_hora_fin` datetime NOT NULL,

  PRIMARY KEY (`cod_inv_disp`),
  KEY `cod_dispositivo` (`cod_dispositivo`),
  KEY `cod_investigacion` (`cod_investigacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `investigacion_log` (
  `cod_log` int(10) NOT NULL AUTO_INCREMENT,
  `cod_sesion` int(11) DEFAULT NULL,
  `cod_investigacion` int(6) UNSIGNED ZEROFILL NOT NULL,
  `extra_data` varchar(300) DEFAULT NULL,
  `cod_accion` varchar(20) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,

  PRIMARY KEY (`cod_log`),
  KEY `cod_investigacion` (`cod_investigacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `investigacion_video` (
  `cod_video` int(6) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `cod_investigacion` int(6) UNSIGNED ZEROFILL NOT NULL,
  `instanceId` varchar(36) NOT NULL,
  `tipo_analisis` varchar(100) NOT NULL,
  `cod_usuario` int(6) UNSIGNED ZEROFILL NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `coordenadas` varchar(200) DEFAULT NULL,
  `fecha_hora_subida` datetime NOT NULL,

  PRIMARY KEY (`cod_video`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

ALTER TABLE `investigacion` ADD CONSTRAINT `fk_investigacion_cod_usuario` FOREIGN KEY (`cod_usuario`) REFERENCES `${CORE_DB_NAME}`.`usuarios` (`cod_usuario`) ON DELETE CASCADE;

ALTER TABLE `investigacion_dispositivo` ADD CONSTRAINT `fk_investigacion_dispositivo_cod_dispositivo` FOREIGN KEY (`cod_dispositivo`) REFERENCES `${CORE_DB_NAME}`.`dispositivos` (`cod_dispositivo`) ON DELETE CASCADE;
ALTER TABLE `investigacion_dispositivo` ADD CONSTRAINT `fk_investigacion_dispositivo_cod_investigacion` FOREIGN KEY (`cod_investigacion`) REFERENCES `investigacion` (`cod_investigacion`) ON DELETE CASCADE;

ALTER TABLE `investigacion_log` ADD CONSTRAINT `fk_investigacion_log_cod_investigacion` FOREIGN KEY (`cod_investigacion`) REFERENCES `investigacion` (`cod_investigacion`) ON DELETE CASCADE;


-- +goose Down
ALTER TABLE `investigacion_log` DROP FOREIGN KEY `fk_investigacion_log_cod_investigacion`;

ALTER TABLE `investigacion_dispositivo` DROP FOREIGN KEY `fk_investigacion_dispositivo_cod_investigacion`;
ALTER TABLE `investigacion_dispositivo` DROP FOREIGN KEY `fk_investigacion_dispositivo_cod_dispositivo`;

ALTER TABLE `investigacion` DROP FOREIGN KEY `fk_investigacion_cod_usuario`;

DROP TABLE IF EXISTS `investigacion_video`;
DROP TABLE IF EXISTS `investigacion_log`;
DROP TABLE IF EXISTS `investigacion_dispositivo`;
DROP TABLE IF EXISTS `investigacion`;
