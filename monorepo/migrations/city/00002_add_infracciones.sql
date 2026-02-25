-- +goose envsub on

-- +goose Up
CREATE TABLE IF NOT EXISTS `infracciones` (
  `cod_infraccion` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `desc_infraccion` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish_ci NOT NULL,
  `importe_infraccion` decimal(10,2) NOT NULL,
  `importe_reducido` decimal(10,2) NOT NULL,
  `puntos` int(2) NOT NULL,
  `cod_modulo` int(4) UNSIGNED ZEROFILL DEFAULT NULL,

  PRIMARY KEY (`cod_infraccion`),
  KEY `cod_modulo` (`cod_modulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `infracciones` (`cod_infraccion`, `desc_infraccion`, `importe_infraccion`, `importe_reducido`, `puntos`, `cod_modulo`) VALUES
('CIR22', 'Cruzar linea contingua', 220.00, 110.00, 0, 0015),
('CON115B', 'Conducir el vehiculo rese?ado careciendo de autorizaci?n administrativa de conducci?n v?lida en Espa?a, siendo titular de permiso extranjero equivalente susceptible de ser canjeado', 500.00, 250.00, 0, 0015),
('CON115C', 'Conducir un vehiculo con un permiso o licencia que no le habilite para ello (Debe quedar reflejado tipo de vehiculo que conduce y tipo de permiso que posee). DETRACCION 4 PTOS', 500.00, 250.00, 0, 0015),
('CON1245A', 'Conducir el vehiculo rese?ado con la autorizaci?n administrativa para conducir caducada', 200.00, 100.00, 0, 0015),
('CON2515A', 'Conducir un vehiculo que transporta materias peligrosas sin haber obtenido la autorizaci?n especial correspondiente', 500.00, 200.00, 0, 0015),
('CON315A', 'Conducir el vehiculo rese?ado con una licencia o permiso de conducci?n incumpliendo las condiciones restrictivas o mencionadas especiales que figuran en la misma (Especificar incumplimiento)', 200.00, 100.00, 0, 0015),
('OM24.44', 'Estacionar damunt marca groga longitudinal contínua', 100.00, 50.00, 0, 0015),
('SOA215A', 'Carecer del seguro obligatorio el vehiculo rese?ado para cuya conducci?n se exige permiso de la clase AM', 650.00, 325.00, 0, 0015),
('SOA215B', 'Carecer del seguro obligatorio el vehiculo rese?ado para cuya conducci?n se exige el permiso de las clases A2, A1 o A', 700.00, 350.00, 0, 0015),
('SOA215C', 'Carecer del seguro obligatorio el vehiculo rese?ado para cuya conducci?n se exige el permiso de la clase  B', 800.00, 400.00, 0, 0015),
('SOA215D', 'Carecer del seguro obligatorio el vehiculo rese?ado para cuya conducci?n se exige el permiso de las clases C1, CI+E,C, C+E, D1, D1+E, D o D+E', 1500.00, 750.00, 0, 0015),
('SOA215E', 'Carecer del seguro obligatorio el vehiculo rese?ado para cuya conducci?n se exige permiso de la clase BTP', 1500.00, 750.00, 0, 0015),
('SOA3A5A', 'Circular con un vehiculo sin tener concertado el seguro obligatorio, cuando su conducci?n requiere permiso de la clase AM', 1000.00, 500.00, 0, 0015),
('SOA3A5B', 'Circular con un vehiculo sin tener concertado el seguro obligatorio, cuando su conducci?n requiere permisos de la clase  A2, A1 o A', 1250.00, 625.00, 0, 0015),
('SOA3A5C', 'Circular con un vehiculo sin tener concertado el seguro obligatorio, cuando su conducci?n requiere permiso de la clase B', 1500.00, 750.00, 0, 0015),
('SOA3A5D', 'Circular con un vehiculo sin tener concertado el seguro obligatorio, cuando su conducci?n requiere permiso de las clases C1, CI+E,C, C+E, D1, D1+E, D o D+E', 2800.00, 1400.00, 0, 0015),
('VEH1011C', 'Circular con el vehiculo rese?ado cuya inspecci?n t?cnica ha resultado desfavorable', 200.00, 100.00, 0, 0015),
('VEH1015A', 'No haber presentado a la Inspecci?n T?cnica peri?dica, en el plazo debido, el vehiculo rese?ado', 200.00, 100.00, 0, 0015),
('VEH1015B', 'Circular con el vehiculo rese?ado cuya Inspecci?n T?cnica ha resultado negativa por incumplir el vehiculo las condiciones t?cnicas que garantizan la seguridad vial', 500.00, 0.00, 0, 0015),
('VEH115A', 'Circular sin haber obtenido la correspondiente autorizaci?n administrativa del vehiculo (Causa de posible inmovilizaci?n y dep?sito del vehiculo, art?culos 84 y 85 LSV)', 500.00, 250.00, 0, 0015),
('VEH1815A', 'Instalar dispositivos de se?ales especiales sin autorizaci?n de la Jefatura Provincial de Tr?fico correspondiente', 200.00, 100.00, 0, 0015),
('VEH1815B', 'No llevar instalada en el vehiculo la se?al reglamentaria corespondiente (Deber? indicarse la se?al omitida)', 80.00, 40.00, 0, 0015),
('VEH2615A', 'No exhibir al Agente de la autoridad la documentaci?n reglamentaria del vehiculo rese?ado', 10.00, 5.00, 0, 0015),
('VEH3025B', 'No comunicar el cambio de domicilio el titular del vehiculo rese?ado en el plazo reglamentario  (15 d?as desde la fecha en que se produzca)', 80.00, 40.00, 0, 0015),
('VEH955A', 'Circular con el vehiculo rese?ado arrastrando un remolque ligero que no est? dotado de Tarjeta de Inspecci?n T?cnica', 500.00, 250.00, 0, 0015);

ALTER TABLE `infracciones` ADD CONSTRAINT `fk_infracciones_cod_modulo` FOREIGN KEY (`cod_modulo`) REFERENCES `${CORE_DB_NAME}`.`modulos` (`cod_modulo`) ON DELETE SET NULL;

-- +goose Down
ALTER TABLE `infracciones` DROP FOREIGN KEY `fk_infracciones_cod_modulo`;

DROP TABLE IF EXISTS `infracciones`;
