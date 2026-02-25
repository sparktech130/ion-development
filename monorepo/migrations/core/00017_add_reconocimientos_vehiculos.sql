-- +goose Up

CREATE TABLE IF NOT EXISTS `vehiculos_reconocidos` (
  `cod_reconoc` int(6) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `cod_provincia` int(2) UNSIGNED ZEROFILL NOT NULL,
  `cod_poblacion` int(6) UNSIGNED ZEROFILL NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `matricula` varchar(20) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `pais` varchar(3) NOT NULL,
  `confidence` decimal(10,6) NOT NULL,
  `foto` longtext CHARACTER SET latin1 COLLATE latin1_general_ci DEFAULT NULL,
  `foto2` longtext DEFAULT NULL,
  `fotop` longtext DEFAULT NULL,
  `incidencia` varchar(200) CHARACTER SET latin1 COLLATE latin1_general_ci DEFAULT NULL,
  `cod_dispositivo` int(6) UNSIGNED ZEROFILL NOT NULL,
  `fecha_modif` datetime NOT NULL DEFAULT (current_timestamp()),
  `marca` varchar(30) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `modelo` varchar(30) NOT NULL,
  `color` varchar(20) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `tipo_vh` varchar(30) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `estado` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `distintivo` varchar(50) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `velocidad_vehiculo` int(3) DEFAULT NULL,
  `latitud` varchar(20) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `longitud` varchar(20) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `orientacion` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish_ci NOT NULL,
  `cod_alertagest` varchar(100) DEFAULT NULL,
  `cod_usuario` int(6) UNSIGNED ZEROFILL DEFAULT NULL,
  `modulos` varchar(50) DEFAULT NULL,

  PRIMARY KEY (`cod_reconoc`),
  UNIQUE KEY `reconocimiento único` (`matricula`,`cod_dispositivo`,`fecha`,`hora`) USING BTREE,
  KEY `date` (`fecha`,`hora`),
  KEY `reconocimiento_dispositivo` (`cod_dispositivo`,`cod_reconoc`) USING BTREE,

  FOREIGN KEY (`cod_dispositivo`) REFERENCES `dispositivos` (`cod_dispositivo`) ON DELETE CASCADE,
  FOREIGN KEY (`cod_usuario`) REFERENCES `usuarios` (`cod_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `vehiculos_reconocidos_mark` (
  `cod_mark` int(11) AUTO_INCREMENT,
  `cod_usuario` int(6) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_reconoc` int(6) UNSIGNED ZEROFILL DEFAULT NULL,

  PRIMARY KEY(`cod_mark`),

  KEY (`cod_usuario`),
  KEY (`cod_reconoc`),

  FOREIGN KEY (`cod_usuario`) REFERENCES `usuarios` (`cod_usuario`),
  FOREIGN KEY (`cod_reconoc`) REFERENCES `vehiculos_reconocidos` (`cod_reconoc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;


-- +goose Down

DROP TABLE IF EXISTS `vehiculos_reconocidos_mark`;
DROP TABLE IF EXISTS `vehiculos_reconocidos`;

