-- +goose Up
CREATE TABLE IF NOT EXISTS `sectores_verticales` (
  `cod_sector` int(3) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `nombre_sector` varchar(100) NOT NULL,

  PRIMARY KEY (`cod_sector`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `modulos` (
  `cod_modulo` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `abreviacion` varchar(6) NOT NULL,
  `nombre_modulo` varchar(20) DEFAULT NULL,
  `cod_sector` int(6) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`cod_modulo`) USING BTREE,
  KEY `sector` (`cod_sector`),

  FOREIGN KEY (`cod_sector`) REFERENCES `sectores_verticales`(`cod_sector`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `modulos_seccion` (
  `cod_seccion` int(4) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `cod_front` varchar(200) DEFAULT NULL,
  `abreviacion` varchar(6) NOT NULL,
  `nombre_seccion` varchar(30) DEFAULT NULL,
  `cod_modulo` int(4) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_sector_unico` int(3) UNSIGNED ZEROFILL NULL,

  PRIMARY KEY (`cod_seccion`) USING BTREE,
  KEY `cod_modulo` (`cod_modulo`),
  KEY `cod_sector_unico` (`cod_sector_unico`),

  FOREIGN KEY (`cod_modulo`) REFERENCES `modulos` (`cod_modulo`) ON DELETE CASCADE,
  FOREIGN KEY (`cod_sector_unico`) REFERENCES `sectores_verticales` (`cod_sector`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- +goose Down
DROP TABLE IF EXISTS `modulos_seccion`;
DROP TABLE IF EXISTS `modulos`;
DROP TABLE IF EXISTS `sectores_verticales`;
