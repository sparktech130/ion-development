-- +goose envsub on

-- +goose Up

CREATE TABLE IF NOT EXISTS `alertas_gestion` (
  `cod_alertagest` int(4) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `nombre_alerta` varchar(50) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `desc_alerta` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `tipo_alerta` varchar(200) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `destinatarios_mail` varchar(100) NOT NULL,
  `destinatarios_sms` varchar(200) NOT NULL,
  `destinatarios_llamada` varchar(200) NOT NULL,
  `cod_provincia` int(2) UNSIGNED ZEROFILL NOT NULL,
  `cod_poblacion` int(6) UNSIGNED ZEROFILL NOT NULL,
  `cod_modulo` int(4) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`cod_alertagest`),
  KEY `cod_modulo` (`cod_modulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `alertas_gestion` (`cod_alertagest`, `nombre_alerta`, `desc_alerta`, `tipo_alerta`, `destinatarios_mail`, `destinatarios_sms`, `destinatarios_llamada`, `cod_provincia`, `cod_poblacion`, `cod_modulo`) VALUES
(0001, 'Exceso de velocidad', '', 'mail', '', '', '', 00, 000000, 0015),
(0002, 'Carril incorrecto', '', 'sms', '', '', '', 00, 000000, 0015),
(0003, 'Vehículo sin documentación', '', 'mail;sms', '', ';615111111', '', 00, 000000, 0015),
(0004, 'Vehículo sin ITV', '', 'llamada', '', '622222222', '', 01, 000001, 0015),
(0005, 'Adelantamiento en línea continua', '', 'llamada', '', '', '', 01, 000001, 0015),
(0006, 'Vehículo sin seguro', '', 'llamada;mail', '', '', '', 01, 000001, 0015),
(0007, 'Salto semafórico', '', 'llamada;mail;sms', '', '', '', 01, 000001, 0015),
(0008, 'Prohibido aparcar', '', 'sms', '', '', '', 01, 000001, 0015),
(0009, 'Vehículo robado', '', 'sms', '', '', '', 01, 000001, 0015),
(0010, 'Salto STOP', '', 'llamada;mail;sms', '', '', '', 00, 000000, 0015),
(0011, 'Giro indebido', '', 'llamada;mail', '', '', '', 00, 000000, 0015),
(0012, 'Área reservada', 'Parar en un carril o parte de la vía reservada exclusivamente para el servicio de determinados usuar', 'mail', '', '', '', 00, 000000, 0015),
(0100, 'ZAR', '', 'mail;sms', ';ion@smart.eu', ';6852123456', '', 01, 000001, 0011),
(0101, 'ZBE', '', 'llamada;mail', '', '', '', 01, 000001, 0011),
(0102, 'DUM', '', 'llamada;mail;sms', '', '', '', 01, 000001, 0011),
(0103, 'NIEVE', '', 'llamada', '', '', '', 01, 000001, 0011),
(0104, 'Área reservada', 'Parar en un carril o parte de la vía reservada exclusivamente para el servicio de determinados usuar', 'mail', '', '', '', 00, 000000, 0011),
(0105, 'Giro indebido', '', 'llamada;mail', '', '', '', 00, 000000, 0011),
(0106, 'Carril incorrecto', '', 'sms', '', '', '', 00, 000000, 0011),
(0107, 'Adelantamiento en línea continua', '', 'llamada', '', '', '', 01, 000001, 0011),
(0108, 'Salto semafórico', '', 'llamada;mail;sms', '', '', '', 01, 000001, 0011),
(0109, 'Prohibido aparcar', '', 'sms', '', '', '', 01, 000001, 0011),
(0110, 'Objeto abandonado', 'Se ha detectado un objeto abandonado en un dispositivo', 'sms', '', '', '', 01, 000001, 0011);


CREATE TABLE IF NOT EXISTS `alertas` (
  `cod_alerta` int(6) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `cod_reconoc` int(6) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_campaign` int(6) UNSIGNED ZEROFILL DEFAULT NULL,
  `matricula` varchar(10) DEFAULT NULL,
  `cod_alertagest` int(4) UNSIGNED ZEROFILL DEFAULT NULL,
  `incidencia` varchar(40) NOT NULL,
  `cod_dispositivo` int(6) UNSIGNED ZEROFILL NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `estat` varchar(10) NOT NULL,
  `motivo` varchar(500) DEFAULT NULL,
  `usuario` varchar(10) DEFAULT NULL,
  `f_modif` datetime NOT NULL,
  `imagen` varchar(200) DEFAULT NULL,
  `cod_area` int(4) UNSIGNED ZEROFILL DEFAULT NULL,
  `zoneId` varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `cod_infraccion` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `velocidad_max` int(3) DEFAULT NULL,

  PRIMARY KEY (`cod_alerta`),
  KEY `cod_alertagest` (`cod_alertagest`),
  KEY `cod_campaign` (`cod_campaign`),
  KEY `cod_reconoc` (`cod_reconoc`),
  KEY `cod_dispositivo` (`cod_dispositivo`),
  KEY `zoneId` (`zoneId`),
  KEY `cod_area` (`cod_area`),
  KEY `cod_infraccion` (`cod_infraccion`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

ALTER TABLE `alertas_gestion` ADD CONSTRAINT `fk_alertas_gestion_cod_modulo` FOREIGN KEY (`cod_modulo`) REFERENCES `${CORE_DB_NAME}`.`modulos` (`cod_modulo`) ON DELETE CASCADE;
ALTER TABLE `alertas` ADD CONSTRAINT `fk_alertas_cod_alertagest` FOREIGN KEY (`cod_alertagest`) REFERENCES `alertas_gestion` (`cod_alertagest`) ON DELETE CASCADE;
ALTER TABLE `alertas` ADD CONSTRAINT `fk_alertas_cod_campaign` FOREIGN KEY (`cod_campaign`) REFERENCES `campaign` (`cod_campaign`) ON DELETE SET NULL;
ALTER TABLE `alertas` ADD CONSTRAINT `fk_alertas_cod_reconoc` FOREIGN KEY (`cod_reconoc`) REFERENCES `${CORE_DB_NAME}`.`vehiculos_reconocidos` (`cod_reconoc`) ON DELETE CASCADE;
ALTER TABLE `alertas` ADD CONSTRAINT `fk_alertas_cod_dispositivo` FOREIGN KEY (`cod_dispositivo`) REFERENCES `${CORE_DB_NAME}`.`dispositivos` (`cod_dispositivo`) ON DELETE CASCADE;
ALTER TABLE `alertas` ADD CONSTRAINT `fk_alertas_zoneId` FOREIGN KEY (`zoneId`) REFERENCES `${CORE_DB_NAME}`.`analysis_zona_deteccion` (`zoneId`) ON DELETE SET NULL;
ALTER TABLE `alertas` ADD CONSTRAINT `fk_alertas_cod_area` FOREIGN KEY (`cod_area`) REFERENCES `area_restringida` (`cod_area`) ON DELETE SET NULL;
ALTER TABLE `alertas` ADD CONSTRAINT `fk_alertas_cod_infraccion` FOREIGN KEY (`cod_infraccion`) REFERENCES `infracciones` (`cod_infraccion`) ON DELETE SET NULL;

-- +goose Down
ALTER TABLE `alertas` DROP FOREIGN KEY `fk_alertas_cod_infraccion`;
ALTER TABLE `alertas` DROP FOREIGN KEY `fk_alertas_cod_area`;
ALTER TABLE `alertas` DROP FOREIGN KEY `fk_alertas_zoneId`;
ALTER TABLE `alertas` DROP FOREIGN KEY `fk_alertas_cod_dispositivo`;
ALTER TABLE `alertas` DROP FOREIGN KEY `fk_alertas_cod_reconoc`;
ALTER TABLE `alertas` DROP FOREIGN KEY `fk_alertas_cod_campaign`;
ALTER TABLE `alertas` DROP FOREIGN KEY `fk_alertas_cod_alertagest`;

ALTER TABLE `alertas_gestion` DROP FOREIGN KEY `fk_alertas_gestion_cod_modulo`;

DROP TABLE IF EXISTS `alertas`;
DROP TABLE IF EXISTS `alertas_gestion`;
