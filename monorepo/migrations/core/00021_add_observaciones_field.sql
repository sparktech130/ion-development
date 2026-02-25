-- +goose Up
ALTER TABLE `vehiculos_reconocidos` ADD `observaciones` TEXT NULL AFTER `cod_usuario`;

-- +goose Down
ALTER TABLE `vehiculos_reconocidos` DROP COLUMN `observaciones`;
