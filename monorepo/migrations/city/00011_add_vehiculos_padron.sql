-- +goose Up
CREATE TABLE IF NOT EXISTS `vehiculo_padron` (
  `matricula` varchar(20) NOT NULL,
  `marca` varchar(30) DEFAULT NULL,
  `modelo` varchar(30) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `fecha_fin_padron` date DEFAULT NULL,

  PRIMARY KEY (`matricula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- +goose Down
DROP TABLE IF EXISTS `vehiculo_padron`;
