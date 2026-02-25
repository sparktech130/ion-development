-- +goose envsub on
-- +goose Up
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
