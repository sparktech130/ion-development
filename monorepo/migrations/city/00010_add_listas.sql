-- +goose Up
CREATE TABLE IF NOT EXISTS `listas` (
  `cod_lista` int(4) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `nombre_lista` varchar(50) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `desc_lista` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `tipo_alerta` varchar(200) DEFAULT NULL,
  `cod_provincia` int(2) NOT NULL,
  `cod_poblacion` int(6) NOT NULL,

  PRIMARY KEY (`cod_lista`),
  KEY `nombre_lista` (`nombre_lista`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `listas_destinatarios` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `cod_lista` int(4) UNSIGNED ZEROFILL NOT NULL,
  `nombre` varchar(120) DEFAULT NULL,
  `canal` enum('email','sms','whatsapp') NOT NULL DEFAULT 'email',
  `destinatario` varchar(190) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),

  PRIMARY KEY (`id`),
  KEY `idx_lista` (`cod_lista`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `listas_vehiculos` (
  `cod_vehic_lista` int(6) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `matricula` varchar(12) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `descripcion_vehiculo` varchar(100) NOT NULL,
  `cod_lista` int(4) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`cod_vehic_lista`),
  UNIQUE KEY `matricula_lista` (`matricula`,`cod_lista`),
  KEY `matricula` (`matricula`),
  KEY `cod_lista` (`cod_lista`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `listas_destinatarios` ADD CONSTRAINT `fk_listas_destinatarios_cod_lista` FOREIGN KEY (`cod_lista`) REFERENCES `listas` (`cod_lista`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `listas_vehiculos` ADD CONSTRAINT `fk_listas_vehiculos_cod_lista` FOREIGN KEY (`cod_lista`) REFERENCES `listas` (`cod_lista`) ON DELETE CASCADE;

-- +goose Down
ALTER TABLE `listas_vehiculos` DROP FOREIGN KEY `fk_listas_vehiculos_cod_lista`;
ALTER TABLE `listas_destinatarios` DROP FOREIGN KEY `fk_listas_destinatarios_cod_lista`;

DROP TABLE IF EXISTS `listas_vehiculos`;
DROP TABLE IF EXISTS `listas_destinatarios`;
DROP TABLE IF EXISTS `listas`;
