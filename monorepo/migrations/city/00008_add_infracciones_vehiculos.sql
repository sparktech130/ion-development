-- +goose envsub on

-- +goose Up
CREATE TABLE IF NOT EXISTS `infracciones_vehiculos` (
  `cod_sancion` int(6) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `cod_reconoc` int(6) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_alerta` int(6) UNSIGNED ZEROFILL NOT NULL,
  `estat` varchar(2) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `envio` varchar(2) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `motivo` varchar(500) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `cod_infraccion` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `fecha_modif` datetime NOT NULL,
  `usuario` varchar(50) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `tipo` varchar(40) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,

  PRIMARY KEY (`cod_sancion`),
  KEY `cod_reconoc` (`cod_reconoc`),
  KEY `cod_alerta` (`cod_alerta`),
  KEY `cod_infraccion` (`cod_infraccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `infracciones_vehiculos` ADD CONSTRAINT `fk_infracciones_vehiculos_cod_reconoc` FOREIGN KEY (`cod_reconoc`) REFERENCES `${CORE_DB_NAME}`.`vehiculos_reconocidos` (`cod_reconoc`);
ALTER TABLE `infracciones_vehiculos` ADD CONSTRAINT `fk_infracciones_vehiculos_cod_alerta` FOREIGN KEY (`cod_alerta`) REFERENCES `alertas` (`cod_alerta`);
ALTER TABLE `infracciones_vehiculos` ADD CONSTRAINT `fk_infracciones_vehiculos_cod_infraccion` FOREIGN KEY (`cod_infraccion`) REFERENCES `infracciones` (`cod_infraccion`);


-- +goose Down
ALTER TABLE `infracciones_vehiculos` DROP FOREIGN KEY `fk_infracciones_vehiculos_cod_infraccion`;
ALTER TABLE `infracciones_vehiculos` DROP FOREIGN KEY `fk_infracciones_vehiculos_cod_alerta`;
ALTER TABLE `infracciones_vehiculos` DROP FOREIGN KEY `fk_infracciones_vehiculos_cod_reconoc`;

DROP TABLE IF EXISTS `infracciones_vehiculos`;
