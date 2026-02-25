-- +goose Up
-- +goose StatementBegin
ALTER TABLE `listas_destinatarios` CHANGE `canal` `canal` ENUM('email','sms','whatsapp','call') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'email';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE `listas_destinatarios` CHANGE `canal` `canal` ENUM('email','sms','whatsapp') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'email';
-- +goose StatementEnd
