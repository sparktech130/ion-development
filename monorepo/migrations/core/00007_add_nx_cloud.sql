-- +goose Up
CREATE TABLE IF NOT EXISTS `cloud_nx` (
  `cod_cloud` int(5) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `systemId` varchar(50) DEFAULT NULL,
  `ip` varchar(20) DEFAULT NULL,
  `puerto` int(6) DEFAULT NULL,
  `user` varchar(100) NOT NULL,
  `password` varchar(250) NOT NULL,
  `cloud_user` varchar(100) NOT NULL,
  `cloud_password` varchar(250) NOT NULL,
  `cod_sector` int(3) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`cod_cloud`),
  UNIQUE KEY `systemId` (`systemId`),
  KEY `cod_sector` (`cod_sector`),

  FOREIGN KEY (`cod_sector`) REFERENCES `sectores_verticales` (`cod_sector`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `cloud_keys` (
  `cod_key` int(11) NOT NULL AUTO_INCREMENT,
  `authKey` varchar(400) NOT NULL,
  `cod_cloud` int(5) UNSIGNED ZEROFILL NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,

  PRIMARY KEY (`cod_key`),

  FOREIGN KEY (`cod_cloud`) REFERENCES `cloud_nx` (cod_cloud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `cloud_layouts` (
  `layoutId` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `cod_cloud` int(5) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`layoutId`),

  FOREIGN KEY (`cod_cloud`) REFERENCES `cloud_nx` (cod_cloud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `cloud_layouts_modulos` (
  `cod_lay_mod` int(5) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `layoutId` varchar(36) NOT NULL,
  `cod_modulo` int(4) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`cod_lay_mod`),

  FOREIGN KEY (`layoutId`) REFERENCES `cloud_layouts` (layoutId),
  FOREIGN KEY (`cod_modulo`) REFERENCES `modulos` (cod_modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `cloud_session_token` (
  `cod_token` int(11) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `token` varchar(1000) NOT NULL,
  `cod_cloud` int(5) UNSIGNED ZEROFILL NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,

  PRIMARY KEY (`cod_token`),

  FOREIGN KEY (`cod_cloud`) REFERENCES `cloud_nx` (cod_cloud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- +goose Down
DROP TABLE IF EXISTS IF EXISTS `cloud_nx`;
DROP TABLE IF EXISTS IF EXISTS `cloud_keys`;
DROP TABLE IF EXISTS IF EXISTS `cloud_layouts`;

DROP TABLE IF EXISTS IF EXISTS `cloud_layouts_modulos`;
DROP TABLE IF EXISTS IF EXISTS `cloud_session_token`;
