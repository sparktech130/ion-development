-- +goose envsub on

-- +goose Up
CREATE TABLE IF NOT EXISTS `dispositivos_velocidades` (
  `cod_registro` int(6) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `cod_dispositivo` int(6) UNSIGNED ZEROFILL NOT NULL,
  `velocidad_max` int(3) DEFAULT NULL,
  `cod_infraccion` varchar(15) DEFAULT NULL,

  PRIMARY KEY (`cod_registro`),
  KEY `cod_dispositivo` (`cod_dispositivo`),
  KEY `cod_infraccion` (`cod_infraccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `dispositivo_area` (
  `cod_area` int(4) UNSIGNED ZEROFILL NOT NULL,
  `cod_dispositivo` int(6) UNSIGNED ZEROFILL NOT NULL,

  UNIQUE KEY `cod_area` (`cod_area`,`cod_dispositivo`),
  KEY `cod_dispositivo` (`cod_dispositivo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

ALTER TABLE `dispositivos_velocidades` ADD CONSTRAINT `fk_dispositivos_velocidades_cod_dispositivo` FOREIGN KEY (`cod_dispositivo`) REFERENCES `${CORE_DB_NAME}`.`dispositivos` (`cod_dispositivo`) ON DELETE CASCADE;
ALTER TABLE `dispositivos_velocidades` ADD CONSTRAINT `fk_dispositivos_velocidades_cod_infraccion` FOREIGN KEY (`cod_infraccion`) REFERENCES `infracciones` (`cod_infraccion`) ON DELETE CASCADE;

ALTER TABLE `dispositivo_area` ADD CONSTRAINT `fk_dispositivo_area_cod_area` FOREIGN KEY (`cod_area`) REFERENCES `area_restringida` (`cod_area`) ON DELETE CASCADE;
ALTER TABLE `dispositivo_area` ADD CONSTRAINT `fk_dispositivo_area_cod_dispositivo` FOREIGN KEY (`cod_dispositivo`) REFERENCES `${CORE_DB_NAME}`.`dispositivos` (`cod_dispositivo`) ON DELETE CASCADE;

-- +goose Down
ALTER TABLE `dispositivo_area` DROP FOREIGN KEY `fk_dispositivo_area_cod_dispositivo`;
ALTER TABLE `dispositivo_area` DROP FOREIGN KEY `fk_dispositivo_area_cod_area`;

ALTER TABLE `dispositivos_velocidades` DROP FOREIGN KEY `fk_dispositivos_velocidades_cod_infraccion`;
ALTER TABLE `dispositivos_velocidades` DROP FOREIGN KEY `fk_dispositivos_velocidades_cod_dispositivo`;

DROP TABLE IF EXISTS `dispositivo_area`;
DROP TABLE IF EXISTS `dispositivos_velocidades`;
