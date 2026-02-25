-- +goose Up
-- +goose StatementBegin
INSERT INTO `fabricantes_categoria` (`cod_categoria`, `nombre_categoria`) VALUES ('0013', 'Dron');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM`fabricantes_categoria` WHERE `cod_categoria` = '0013';
-- +goose StatementEnd
