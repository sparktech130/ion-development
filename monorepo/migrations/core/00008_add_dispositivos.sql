-- +goose Up

CREATE TABLE IF NOT EXISTS `dispositivos` (
  `cod_dispositivo` int(6) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `nom_dispositivo` varchar(40) NOT NULL,
  `cod_nodo` int(6) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_modelo` int(4) UNSIGNED ZEROFILL NOT NULL,
  `protocolo_ip` varchar(20) DEFAULT NULL,
  `ip_dispositivo` varchar(20) DEFAULT NULL,
  `direccion` varchar(60) DEFAULT NULL,
  `cp` varchar(5) DEFAULT NULL,
  `coordenadas` varchar(100) DEFAULT NULL,
  `cod_provincia` int(2) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_poblacion` int(6) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_area` varchar(100) DEFAULT NULL,
  `serial_number` varchar(20) DEFAULT NULL,
  `puerta_enlace` varchar(20) DEFAULT NULL,
  `mascara_red` varchar(20) DEFAULT NULL,
  `direccion_mac` varchar(20) DEFAULT NULL,
  `servidor_dhcp` varchar(2) DEFAULT NULL,
  `deveui` varchar(50) DEFAULT NULL,
  `appeui` varchar(50) DEFAULT NULL,
  `joineui` varchar(100) DEFAULT NULL,
  `appkey` varchar(50) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(200) DEFAULT NULL,
  `cod_cloud` int(5) UNSIGNED ZEROFILL DEFAULT NULL,
  `deviceId` varchar(36) NOT NULL,
  `id_regla_evento` varchar(36) DEFAULT NULL,
  `streamUrl` varchar(200) DEFAULT NULL,

  PRIMARY KEY (`cod_dispositivo`),
  UNIQUE KEY `nx device id` (`deviceId`),
  KEY `cod_modelo` (`cod_modelo`),
  KEY `cod_cloud` (`cod_cloud`),

  FOREIGN KEY (`cod_modelo`) REFERENCES `fabricantes_modelo` (`cod_modelo`),
  FOREIGN KEY (`cod_cloud`) REFERENCES `cloud_nx` (`cod_cloud`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `dispositivos_modulos` (
  `cod_disp_mod` int(5) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `cod_dispositivo` int(6) UNSIGNED ZEROFILL NOT NULL,
  `cod_modulo` int(4) UNSIGNED ZEROFILL NOT NULL,
  `estado_canal` enum('activo','prorroga','caducado') NOT NULL,
  `fecha_fin_prorroga` date DEFAULT NULL,

  PRIMARY KEY (`cod_disp_mod`),
  KEY `cod_modulo` (`cod_modulo`),
  KEY `idx_dm_dispositivo_modulo` (`cod_dispositivo`,`cod_modulo`) USING BTREE,

  FOREIGN KEY (`cod_modulo`) REFERENCES `modulos` (`cod_modulo`),
  FOREIGN KEY (`cod_dispositivo`) REFERENCES `dispositivos` (`cod_dispositivo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;


-- +goose Down

DROP TABLE IF EXISTS IF EXISTS `dispositivos`;
DROP TABLE IF EXISTS IF EXISTS `dispositivos_modulos`;

