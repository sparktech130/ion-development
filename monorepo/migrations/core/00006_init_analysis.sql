-- +goose Up
CREATE TABLE IF NOT EXISTS `analysis` (
  `cod_ai` int(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `solution_code` enum('securt','crowd-estimation') DEFAULT NULL,

  PRIMARY KEY (`cod_ai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

INSERT IGNORE INTO `analysis` (`cod_ai`, `type`, `solution_code`) VALUES
(0001, 'line_crossing', 'securt'),
(0002, 'line_tailgating', 'securt'),
(0003, 'crowding', 'securt'),
(0004, 'loitering', 'securt'),
(0005, 'intrusion', 'securt'),
(0006, 'object_left', 'securt'),
(0007, 'object_removed', 'securt'),
(0008, 'alpr', 'securt'),
(0009, 'fallen_person', 'securt'),
(0010, 'armed_person', 'securt'),
(0011, 'crowd-estimation', 'crowd-estimation'),
(0012, 'crossing', 'securt');

-- +goose Down
DROP TABLE IF EXISTS `analysis`;
