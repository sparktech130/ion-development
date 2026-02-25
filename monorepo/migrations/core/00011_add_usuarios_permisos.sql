-- +goose Up
CREATE TABLE IF NOT EXISTS `usuarios_permisos` (
  `cod_permiso` int(6) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `nombre_permiso` varchar(20) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,

  PRIMARY KEY (`cod_permiso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `usuarios_permisos_clouds` (
  `cod_per_cl` int(6) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `cod_permiso` int(6) UNSIGNED ZEROFILL NOT NULL,
  `cod_cloud` int(5) UNSIGNED ZEROFILL NOT NULL,
  `stream` tinyint(1) NOT NULL,

  PRIMARY KEY (`cod_per_cl`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `usuarios_permisos_secciones` (
  `cod_per_sec` int(9) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `cod_permiso` int(6) UNSIGNED ZEROFILL NOT NULL,
  `cod_seccion` int(4) UNSIGNED ZEROFILL NOT NULL,
  `acceso` tinyint(1) NOT NULL DEFAULT 0,
  `consultas` tinyint(1) NOT NULL DEFAULT 0,
  `editar` tinyint(1) NOT NULL DEFAULT 0,
  `compartir` tinyint(1) NOT NULL DEFAULT 0,

  PRIMARY KEY (`cod_per_sec`),
  KEY `cod_seccion` (`cod_seccion`),
  KEY `cod_permiso` (`cod_permiso`),

  FOREIGN KEY (`cod_seccion`) REFERENCES `modulos_seccion` (`cod_seccion`) ON DELETE CASCADE,
  FOREIGN KEY (`cod_permiso`) REFERENCES `usuarios_permisos` (`cod_permiso`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;


-- +goose Down
DROP TABLE IF EXISTS `usuarios_permisos`;
DROP TABLE IF EXISTS `usuarios_permisos_clouds`;
DROP TABLE IF EXISTS `usuarios_permisos_secciones`;
