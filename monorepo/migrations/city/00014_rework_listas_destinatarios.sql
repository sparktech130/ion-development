-- +goose Up

CREATE TABLE IF NOT EXISTS `listas_destinatarios_new` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `cod_lista` int(4) UNSIGNED ZEROFILL NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `sms_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `whatsapp_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `call_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `horario_email` JSON DEFAULT NULL COMMENT 'Horario de disponibilidad mail por día de la semana',
  `horario_telefono` JSON DEFAULT NULL COMMENT 'Horario de disponibilidad teléfono por día de la semana',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),

  PRIMARY KEY (`id`),
  KEY `idx_lista` (`cod_lista`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `listas_destinatarios_new` 
  ADD CONSTRAINT `fk_listas_destinatarios_new_cod_lista` 
  FOREIGN KEY (`cod_lista`) REFERENCES `listas` (`cod_lista`) 
  ON DELETE CASCADE ON UPDATE CASCADE;


-- +goose Down

ALTER TABLE `listas_destinatarios_new` DROP FOREIGN KEY `fk_listas_destinatarios_new_cod_lista`;

DROP TABLE IF EXISTS `listas_destinatarios_new`;
