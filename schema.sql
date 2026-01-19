CREATE DATABASE running_app;
USE running_app;

CREATE TABLE users (
    id integer PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    race VARCHAR(255) NOT NULL,
    tday DATE NOT NULL,
    tday_run TEXT,
    grade INT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE calendar (
    id integer PRIMARY KEY AUTO_INCREMENT,
    run_day DATE NOT NULL,
    TWR5K VARCHAR(255) NOT NULL,
    TWR10K VARCHAR(255) NOT NULL,
    SL10K VARCHAR(255) NOT NULL
);

INSERT INTO users (full_name, race, tday, tday_run, grade)
VALUES
("Bob Salon", "TWR5K", "2026-01-01", "No run tday", 7),
("Paige Salon", "SL10K", "2026-01-01", "No run tday", 11);

INSERT INTO calendar (run_day, TWR5K, TWR10K, SL10K)
VALUES
("2026-01-01", "No run tday", "No run tday", "No run tday");