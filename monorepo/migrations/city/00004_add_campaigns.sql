-- +goose envsub on

-- +goose Up

CREATE TABLE IF NOT EXISTS `campaign_tipo` (
  `cod_tipo_camp` int(2) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `nombre_tipo` varchar(200) NOT NULL,
  `cod_alertagest` int(4) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`cod_tipo_camp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

INSERT IGNORE INTO `campaign_tipo` (`cod_tipo_camp`, `nombre_tipo`, `cod_alertagest`) VALUES
(01, 'Búsqueda coches sin ITV en regla', 0004),
(02, 'Búsqueda coches sin seguro', 0006);

CREATE TABLE IF NOT EXISTS `campaign` (
  `cod_campaign` int(6) UNSIGNED ZEROFILL AUTO_INCREMENT,
  `nombre_campaign` varchar(200) NOT NULL,
  `fecha_ini` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `analizado_hasta` datetime NOT NULL,
  `cod_tipo_camp` int(2) UNSIGNED ZEROFILL NOT NULL,
  `cod_usuario` int(6) UNSIGNED ZEROFILL NOT NULL,
  `coordenadas` text NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `dispositivos` text NOT NULL,

  PRIMARY KEY (`cod_campaign`),
  KEY `cod_usuario` (`cod_usuario`),
  KEY `cod_tipo_camp` (`cod_tipo_camp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

ALTER TABLE `campaign` ADD CONSTRAINT `fk_campaign_cod_usuario` FOREIGN KEY (`cod_usuario`) REFERENCES `${CORE_DB_NAME}`.`usuarios` (`cod_usuario`) ON DELETE CASCADE;
ALTER TABLE `campaign` ADD CONSTRAINT `fk_campaign_cod_tipo_camp` FOREIGN KEY (`cod_tipo_camp`) REFERENCES `campaign_tipo` (`cod_tipo_camp`);

-- +goose Down
ALTER TABLE `campaign` DROP FOREIGN KEY `fk_campaign_cod_tipo_camp`;
ALTER TABLE `campaign` DROP FOREIGN KEY `fk_campaign_cod_usuario`;

DROP TABLE IF EXISTS `campaign`;
DROP TABLE IF EXISTS `campaign_tipo`;
