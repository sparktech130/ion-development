-- +goose envsub on
-- +goose Up
CREATE TABLE IF NOT EXISTS `vehiculos_reconocidos_listas` (
  `id` int AUTO_INCREMENT,
  `cod_lista` int(4) UNSIGNED ZEROFILL NOT NULL,
  `cod_reconoc` int(6) UNSIGNED ZEROFILL NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `lista_recon` (`cod_lista`, `cod_reconoc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `vehiculos_reconocidos_listas` ADD CONSTRAINT `fk_lista_cod_lista` FOREIGN KEY (`cod_lista`) REFERENCES `listas` (`cod_lista`) ON DELETE CASCADE;
ALTER TABLE `vehiculos_reconocidos_listas` ADD CONSTRAINT `fk_vehiculos_reconocidos_cod_reconoc` FOREIGN KEY (`cod_reconoc`) REFERENCES `${CORE_DB_NAME}`.`vehiculos_reconocidos` (`cod_reconoc`) ON DELETE CASCADE;

-- +goose Down
ALTER TABLE `vehiculos_reconocidos_listas` DROP FOREIGN KEY `fk_lista_cod_lista`;
ALTER TABLE `vehiculos_reconocidos_listas` DROP FOREIGN KEY `fk_vehiculos_reconocidos_cod_reconoc`;

DROP TABLE IF EXISTS `vehiculos_reconocidos_listas`;
