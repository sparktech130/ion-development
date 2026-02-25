-- +goose Up
CREATE TABLE IF NOT EXISTS `area_autorizados` (
  `cod_autorizado` int(6) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `cod_area` int(4) UNSIGNED ZEROFILL NOT NULL,
  `matricula` varchar(12) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `observaciones` text CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `fecha_alta` date NOT NULL,
  `fecha_baja` date NOT NULL,

  PRIMARY KEY (`cod_autorizado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

ALTER TABLE `area_autorizados` ADD CONSTRAINT `fk_area_autorizados_cod_area` FOREIGN KEY (`cod_area`) REFERENCES `area_restringida` (`cod_area`) ON DELETE CASCADE;

-- +goose Down
ALTER TABLE `area_autorizados` DROP FOREIGN KEY `fk_area_autorizados_cod_area`;

DROP TABLE IF EXISTS `area_autorizados`;
