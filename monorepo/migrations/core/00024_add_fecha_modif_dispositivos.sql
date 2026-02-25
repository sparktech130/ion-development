-- +goose Up
ALTER TABLE `dispositivos` ADD `fecha_modif` datetime NOT NULL DEFAULT (current_timestamp()) AFTER `streamUrl`;

-- +goose Down
ALTER TABLE `dispositivos` DROP COLUMN `fecha_modif`;
