-- +goose Up
INSERT IGNORE INTO `fabricantes` (`cod_fabricante`, `nombre_fabricante`, `logo_fabricante`, `descripcion_fabricante`) VALUES
(0001, 'Milesight', 'fabricantes/fotos/Milesight.svg', NULL),
(0002, 'MClimate', 'fabricantes/fotos/MClimate.svg', NULL),
(0003, 'Suprema', 'fabricantes/fotos/Suprema.svg', NULL),
(0004, 'Dahua', 'fabricantes/fotos/Dahua.svg', NULL),
(0005, 'Bossauto', 'fabricantes/fotos/Bossauto.svg', NULL),
(0006, 'Tavil', 'fabricantes/fotos/Tavil.svg', NULL),
(0007, 'ION', 'fabricantes/fotos/IONSmart.svg', 'ION');

INSERT IGNORE INTO `fabricantes_categoria` (`cod_categoria`, `nombre_categoria`) VALUES
(0001, 'Sensor ambiente'),
(0002, 'Cámara'),
(0003, 'Sensor acceso'),
(0004, 'Monitor'),
(0005, 'Sensor ultrasonidos'),
(0006, 'Máquina'),
(0007, 'Estación producción'),
(0008, 'Estación de trabajo'),
(0009, 'Materia prima'),
(0010, 'Almacenamiento'),
(0011, 'Muelle'),
(0012, 'Teléfono');

INSERT IGNORE INTO `fabricantes_categoria_sector` (`cod_categoria`, `cod_sector`) VALUES
(0001, 0003),
(0001, 0004),
(0001, 0005),
(0001, 0006),
(0002, 0001),
(0002, 0002),
(0002, 0003),
(0002, 0004),
(0002, 0005),
(0002, 0006),
(0003, 0003),
(0003, 0004),
(0003, 0005),
(0003, 0006),
(0004, 0001),
(0004, 0002),
(0004, 0003),
(0004, 0004),
(0004, 0005),
(0004, 0006),
(0005, 0001),
(0005, 0002),
(0005, 0003),
(0005, 0004),
(0005, 0005),
(0005, 0006),
(0006, 0006),
(0007, 0006),
(0008, 0006),
(0009, 0006),
(0010, 0006),
(0011, 0006),
(0012, 0001);

INSERT IGNORE INTO `fabricantes_modelo` (`cod_modelo`, `nombre_modelo`, `foto_modelo`, `descripcion_modelo`, `tipo_nx`, `cod_fabricante`, `cod_categoria`, `camara_motorizada`) VALUES
(0001, 'AM319', 'fabricantes/modelos/fotos/AM319.png', NULL, NULL, 0001, 0001, 0),
(0002, 'TS2961-X12TPE', 'fabricantes/modelos/fotos/TS2961-X12TPE.png', NULL, '9a55ee6b-a595-5807-a5ba-d4aff697dc12', 0001, 0002, 1),
(0003, 'VS133', 'fabricantes/modelos/fotos/VS133.png', NULL, NULL, 0001, 0001, 0),
(0004, 'EM400', 'fabricantes/modelos/fotos/EM400.png', NULL, NULL, 0001, 0005, 0),
(0005, 'WS303', 'fabricantes/modelos/fotos/WS303.png', NULL, NULL, 0001, 0001, 0),
(0006, 'GS101', 'fabricantes/modelos/fotos/GS101.png', NULL, NULL, 0001, 0001, 0),
(0007, 'X Station-2', 'fabricantes/modelos/fotos/X-Station-2.png', NULL, NULL, 0003, 0003, 0),
(0008, 'Vicki LoRaWAN', 'fabricantes/modelos/fotos/Vicki-LoRaWAN.png', NULL, NULL, 0002, 0001, 0),
(0009, 'MS-C2961', 'fabricantes/modelos/fotos/MS-C2961.png', NULL, NULL, 0001, 0002, 1),
(0010, 'MS-C8262', 'fabricantes/modelos/fotos/MS-C8262.png', NULL, NULL, 0001, 0002, 0),
(0011, 'MS-C9674', 'fabricantes/modelos/fotos/MS-C9674.png', 'Cámara 360', NULL, 0001, 0002, 0),
(0012, 'MS-C8176-PB', 'fabricantes/modelos/fotos/MS-C8176-PB.png', 'Cámara 180º', NULL, 0001, 0002, 0),
(0013, 'HFW1430DT-STW', 'fabricantes/modelos/fotos/HFW1430DT-STW.png', 'Wi-Fi Bullet Camera', NULL, 0004, 0002, 0),
(0014, 'T600', 'fabricantes/modelos/fotos/T600.webp', 'T600', NULL, 0005, 0006, 0),
(0015, 'Formadora', 'fabricantes/modelos/fotos/Formadora.webp', 'Formadora', NULL, 0006, 0006, 0),
(0016, 'Cerradora', 'fabricantes/modelos/fotos/Cerradora.webp', 'Cerradora', NULL, 0006, 0006, 0),
(0017, 'ION Stream', 'fabricantes/modelos/fotos/IONStream.png', 'ION Stream', NULL, 0007, 0004, 0),
(0018, 'ION COP', 'fabricantes/modelos/fotos/IONCop.png', 'ION Cop Phone APP', NULL, 0007, 0012, 0);


-- +goose Down
DELETE FROM `fabricantes_modelo`;
DELETE FROM `fabricantes_categoria_sector`;
DELETE FROM `fabricantes_categoria`;
DELETE FROM `fabricantes`;
