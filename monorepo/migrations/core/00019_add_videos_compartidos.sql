-- +goose Up

CREATE TABLE IF NOT EXISTS `video_compartido` (
  `cod_video` int(9) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `titulo` varchar(500) NOT NULL,
  `velocidad` decimal(10,2) NOT NULL DEFAULT 1.00,
  `enlace_video` varchar(500) DEFAULT NULL,
  `imagen` varchar(300) DEFAULT NULL,
  `cod_dispositivo` int(6) UNSIGNED ZEROFILL NOT NULL,
  `usuario_inicial` int(6) UNSIGNED ZEROFILL NOT NULL,
  `usuario_compartido` int(6) UNSIGNED ZEROFILL DEFAULT NULL,
  `mail_compartido` varchar(200) DEFAULT NULL,
  `pos` bigint(20) DEFAULT NULL,
  `endPos` bigint(20) DEFAULT NULL,
  `fecha_hora_compartido` datetime NOT NULL,
  `fecha_hora_caducidad` datetime DEFAULT NULL,
  `cod_modulo` int(4) UNSIGNED ZEROFILL DEFAULT NULL,

  PRIMARY KEY (`cod_video`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `video_compartido_timeline` (
  `cod_timeline` int(9) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `cod_video` int(9) UNSIGNED ZEROFILL NOT NULL,
  `movimiento` tinyint(1) DEFAULT 0,
  `datos` longtext DEFAULT NULL,

  PRIMARY KEY (`cod_timeline`),
  FOREIGN KEY (`cod_video`) REFERENCES `video_compartido` (`cod_video`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;


-- +goose Down

DROP TABLE IF EXISTS `video_compartido_timeline`;
DROP TABLE IF EXISTS `video_compartido`;

