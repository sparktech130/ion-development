-- +goose Up

CREATE TABLE IF NOT EXISTS `usuarios` (
  `cod_usuario` int(6) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `login` varchar(20) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `foto_perfil` varchar(500) DEFAULT NULL,
  `nombre` varchar(40) NOT NULL,
  `apellidos` varchar(40) NOT NULL,
  `password` varchar(200) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `permisos` int(6) UNSIGNED ZEROFILL NOT NULL,
  `idioma` varchar(10) CHARACTER SET latin1 COLLATE latin1_general_ci DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `ioncop_access` tinyint(1) NOT NULL DEFAULT 0,

  PRIMARY KEY (`cod_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Demo user demo:demo
INSERT IGNORE INTO `usuarios` (`cod_usuario`, `login`, `nombre_usuario`, `foto_perfil`, `nombre`, `apellidos`, `password`, `permisos`, `idioma`, `email`, `telefono`, `ioncop_access`) VALUES (NULL, 'demo', 'demo', NULL, 'Demo', '', '2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea', '000001', 'es', 'demo@ionsmart.eu', NULL, '1');

CREATE TABLE IF NOT EXISTS `usuarios_grids` (
  `cod_grid` int(10) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `nombre_grid` varchar(100) NOT NULL,
  `dispositivos` varchar(200) DEFAULT NULL,
  `cod_usuario` int(6) UNSIGNED ZEROFILL DEFAULT NULL,

  PRIMARY KEY (`cod_grid`),
  FOREIGN KEY (`cod_usuario`) REFERENCES `usuarios` (`cod_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `usuarios_grids_modulos` (
  `cod_grid_mod` int(10) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `cod_grid` int(10) UNSIGNED ZEROFILL NOT NULL,
  `cod_modulo` int(10) UNSIGNED ZEROFILL NOT NULL,
  `seleccionado` tinyint(1) NOT NULL DEFAULT 0,

  PRIMARY KEY (`cod_grid_mod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;


-- +goose Down
DROP TABLE IF EXISTS `usuarios`;
