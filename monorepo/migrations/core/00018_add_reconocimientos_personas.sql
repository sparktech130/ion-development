-- +goose Up

CREATE TABLE IF NOT EXISTS `persona_reconocimiento` (
  `refTrackingId` char(36) NOT NULL,
  `instanceId` varchar(36) NOT NULL,
  `foto` text NOT NULL,
  `foto_blur` text DEFAULT NULL,
  `fecha_hora` timestamp NOT NULL,
  `genero` varchar(15) NOT NULL,
  `asistido` tinyint(1) NOT NULL,
  `ropa_superior` varchar(50) NOT NULL,
  `ropa_inferior` varchar(50) NOT NULL,
  `telefono` tinyint(1) NOT NULL,
  `gafas` tinyint(1) NOT NULL,
  `edad` varchar(15) NOT NULL,
  `tatuado` tinyint(1) NOT NULL,
  `carga_bolsa` tinyint(1) NOT NULL,
  `fumando` tinyint(1) NOT NULL,
  `cara_tapada` tinyint(1) NOT NULL,

  PRIMARY KEY (`refTrackingId`),
  KEY `instanceId` (`instanceId`),
  KEY `fecha_hora` (`fecha_hora`),

  FOREIGN KEY (`instanceId`) REFERENCES `analysis_cloud_instancias`(`instanceId`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `persona_reconocimiento_mark` (
  `cod_mark` int(11) NOT NULL AUTO_INCREMENT,
  `cod_usuario` int(6) UNSIGNED ZEROFILL DEFAULT NULL,
  `refTrackingId` char(36) DEFAULT NULL,

  PRIMARY KEY (`cod_mark`),
  KEY `cod_usuario` (`cod_usuario`),
  KEY `refTrackingId` (`refTrackingId`),

  FOREIGN KEY (`cod_usuario`) REFERENCES `usuarios` (`cod_usuario`),
  FOREIGN KEY (`refTrackingId`) REFERENCES `persona_reconocimiento` (`refTrackingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;


-- +goose Down

DROP TABLE IF EXISTS `persona_reconocimiento_mark`;
DROP TABLE IF EXISTS `persona_reconocimiento`;

