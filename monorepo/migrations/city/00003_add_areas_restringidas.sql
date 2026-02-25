-- +goose Up

CREATE TABLE IF NOT EXISTS `area_restringida` (
  `cod_area` int(4) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `nombre_area` varchar(50) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `tipo_area` varchar(3) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `cod_infraccion` varchar(15) DEFAULT NULL,
  `coordenadas` text CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,

  PRIMARY KEY (`cod_area`),
  KEY `cod_infraccion` (`cod_infraccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

ALTER TABLE `area_restringida` ADD CONSTRAINT `fk_area_restringida_cod_infraccion` FOREIGN KEY (`cod_infraccion`) REFERENCES `infracciones` (`cod_infraccion`) ON DELETE SET NULL;

-- +goose Down
ALTER TABLE `area_restringida` DROP FOREIGN KEY `fk_area_restringida_cod_infraccion`;

DROP TABLE IF EXISTS `area_restringida`;
