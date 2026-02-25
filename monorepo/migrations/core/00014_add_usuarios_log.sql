-- +goose Up

CREATE TABLE IF NOT EXISTS `mto_usuarios_log_acciones` (
  `cod_accion` int(9) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `desc_accion` varchar(100) DEFAULT NULL,
  `accion` varchar(20) DEFAULT NULL,
  `cod_modulo` int(4) UNSIGNED ZEROFILL DEFAULT NULL,

  PRIMARY KEY (`cod_accion`),
  KEY `cod_modulo` (`cod_modulo`),

  FOREIGN KEY (`cod_modulo`) REFERENCES `modulos`(cod_modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

INSERT IGNORE INTO `mto_usuarios_log_acciones` (`cod_accion`, `desc_accion`, `accion`, `cod_modulo`) VALUES
(000000001, 'AUTENTICAR', '0-AUTH', NULL),
(000000002, 'ACCESO', '1-LGI', NULL),
(000000003, 'CIERRE', '2-LGO', NULL),
(000000004, 'ABRIR', '10-ABR', NULL),
(000000006, 'ABRIR_IMG', '11-IMG', NULL),
(000000007, 'AMPLIAR_IMG', '12-ZOOM', NULL),
(000000008, 'SELECCIONAR_ELEMENTO', '13-ELM1', NULL),
(000000009, 'SELECCIONAR_ELEMENTO2', '14-ELM2', NULL),
(000000010, 'GENERAR_PDF', '15-PDF', NULL),
(000000011, 'GENERAR_CSV', '16-CSV', NULL),
(000000012, 'DESCARGAR', '17-DESC', NULL),
(000000013, 'ENVIAR', '18-ENV', NULL),
(000000014, 'AUTHENTICATED_2FA', '20-2FA', NULL),
(000000015, 'UNAUTHENTICATED', '21-NOAUTH', NULL),
(000000016, 'UNAUTHENTICATED_2FA', '22-NO2FA', NULL),
(000000017, 'LOGOUT', '23-LOUT', NULL),
(000000018, 'LOGOUT_TIMEOUT', '24-TOUT', NULL),
(000000019, 'LOGOUT_ABRUPT', '25-EXIT', NULL),
(000000020, 'ACTUALIZAR_DATOS', '26-UPD', NULL),
(000000021, 'VALIDAR', '27-VAL', NULL),
(000000022, 'RECHAZAR', '28-RECH', NULL),
(000000023, 'ACTIVAR_LPR', '29-LPR', NULL),
(000000024, 'MODO_EDICION', '30-EDIT', NULL),
(000000025, 'Investigación añadida', 'INS-INV', 0001),
(000000026, 'Datos de la investigación modificados', 'UPD-INV', 0001),
(000000027, 'Investigación eliminada', 'DEL-INV', 0001),
(000000028, 'Añadir dispositivos a la investigación', 'INS-DISP-INV', 0001),
(000000029, 'Eliminar dispositivos de la investigación', 'DEL-DISP-INV', 0001),
(000000030, 'Solicitud de archivos', 'SOL-ARC', 0001),
(000000031, 'Añadir archivos', 'ADD-ARC', 0001);

CREATE TABLE IF NOT EXISTS `mto_usuarios_sesiones` (
  `cod_sesion` int(10) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `cod_usuario` int(6) UNSIGNED ZEROFILL NOT NULL,
  `ip` varchar(40) NOT NULL,
  `entrada` datetime NOT NULL,
  `salida` datetime DEFAULT NULL,

  PRIMARY KEY (`cod_sesion`),
  KEY `cod_usuario` (`cod_usuario`),

  FOREIGN KEY (`cod_usuario`) REFERENCES `usuarios`(cod_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE IF NOT EXISTS `mto_usuarios_log` (
  `cod_log` int(10) AUTO_INCREMENT,
  `cod_sesion` int(11) DEFAULT NULL,
  `cod_2fa` varchar(8) DEFAULT NULL,
  `extra_data` varchar(300) DEFAULT NULL,
  `cod_accion` varchar(20) DEFAULT NULL,
  `cod_modulo` int(4) UNSIGNED ZEROFILL DEFAULT NULL,
  `cod_seccion` int(4) UNSIGNED ZEROFILL DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,

  PRIMARY KEY (`cod_log`),
  KEY `cod_sesion` (`cod_sesion`),
  KEY `cod_accion` (`cod_accion`),
  KEY `cod_modulo` (`cod_modulo`),
  KEY `cod_seccion` (`cod_seccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- +goose Down
DROP TABLE IF EXISTS `mto_usuarios_log`;
DROP TABLE IF EXISTS `mto_usuarios_sesiones`;
DROP TABLE IF EXISTS `mto_usuarios_log_acciones`;
