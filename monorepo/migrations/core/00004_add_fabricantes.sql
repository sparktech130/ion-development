-- +goose Up
CREATE TABLE IF NOT EXISTS `fabricantes` (
  `cod_fabricante` int(4) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `nombre_fabricante` varchar(50) DEFAULT NULL,
  `logo_fabricante` varchar(50) DEFAULT NULL,
  `descripcion_fabricante` text DEFAULT NULL,

  PRIMARY KEY (`cod_fabricante`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `fabricantes_categoria` (
  `cod_categoria` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(50) DEFAULT NULL,

  PRIMARY KEY (`cod_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `fabricantes_categoria_sector` (
  `cod_categoria` int(4) UNSIGNED ZEROFILL NOT NULL,
  `cod_sector` int(4) UNSIGNED ZEROFILL NOT NULL,

  UNIQUE KEY `cod_categoria` (`cod_categoria`,`cod_sector`),
  KEY `cod_sector` (`cod_sector`),

  FOREIGN KEY (`cod_categoria`) REFERENCES `fabricantes_categoria` (`cod_categoria`) ON DELETE CASCADE,
  FOREIGN KEY (`cod_sector`) REFERENCES `sectores_verticales` (`cod_sector`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `fabricantes_modelo` (
  `cod_modelo` int(4) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `nombre_modelo` varchar(50) DEFAULT NULL,
  `foto_modelo` varchar(50) DEFAULT NULL,
  `descripcion_modelo` text DEFAULT NULL,
  `tipo_nx` varchar(100) DEFAULT NULL,
  `cod_fabricante` int(4) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_categoria` int(4) UNSIGNED ZEROFILL NOT NULL,
  `camara_motorizada` tinyint(1) NOT NULL DEFAULT 0,

  PRIMARY KEY (`cod_modelo`),
  KEY `cod_fabricante` (`cod_fabricante`),
  KEY `cod_categoria` (`cod_categoria`),

  FOREIGN KEY (`cod_fabricante`) REFERENCES `fabricantes` (`cod_fabricante`) ON DELETE SET NULL,
  FOREIGN KEY (`cod_categoria`) REFERENCES `fabricantes_categoria` (`cod_categoria`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- +goose Down
DROP TABLE IF EXISTS `fabricantes_modelo`;
DROP TABLE IF EXISTS `fabricantes_categoria_sector`;
DROP TABLE IF EXISTS `fabricantes_categoria`;
DROP TABLE IF EXISTS `fabricantes`;
