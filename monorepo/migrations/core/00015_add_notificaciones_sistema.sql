-- +goose Up
CREATE TABLE IF NOT EXISTS `notificaciones` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `fecha_hora` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `tipo` ENUM('email', 'sms', 'whatsapp', 'call') NOT NULL,
    `estado` ENUM('ok','ko','pendiente') NOT NULL,
    `destinatario` VARCHAR(100) NOT NULL,
    `body` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- +goose Down
DROP TABLE IF EXISTS `notificaciones`;
