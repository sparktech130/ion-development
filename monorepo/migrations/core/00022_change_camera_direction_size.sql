-- +goose Up
-- +goose StatementBegin
ALTER TABLE `dispositivos` CHANGE `direccion` `direccion` VARCHAR(300) DEFAULT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE `dispositivos` CHANGE `direccion` `direccion` VARCHAR(60) DEFAULT NULL;
-- +goose StatementEnd
