-- +goose Up
CREATE TABLE IF NOT EXISTS `usuario_notificacion` (
  `cod_notificacion` int(9) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `leido` tinyint(1) DEFAULT 0,
  `datos` longtext NOT NULL,
  `cod_usuario` int(6) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`cod_notificacion`),

  FOREIGN KEY (`cod_usuario`) REFERENCES `usuarios` (cod_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- +goose Down
DROP TABLE IF EXISTS `usuario_notificacion`;
