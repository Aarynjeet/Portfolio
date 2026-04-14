
USE gilla156_db;


CREATE TABLE IF NOT EXISTS players (
    email      VARCHAR(255) NOT NULL,
    birthdate  DATE         NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS results (
    result_id  INT          NOT NULL AUTO_INCREMENT,
    email      VARCHAR(255) NOT NULL,
    score      INT          NOT NULL DEFAULT 0,
    moves      INT          NOT NULL DEFAULT 0,
    finished   TINYINT(1)   NOT NULL DEFAULT 0,  
    played_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (result_id),
    FOREIGN KEY (email) REFERENCES players(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




INSERT IGNORE INTO players (email, birthdate, created_at) VALUES
    ('alice@example.com', '1990-04-15', '2026-03-01 09:00:00'),
    ('bob@test.com',      '1985-07-22', '2026-03-01 10:00:00'),
    ('carol@demo.org',    '1995-11-03', '2026-03-02 11:00:00'),
    ('dave@play.net',     '1988-02-28', '2026-03-02 12:00:00'),
    ('eve@memory.io',     '1992-09-17', '2026-03-03 13:00:00'),
    ('frank@match.ca',    '1975-06-30', '2026-03-03 14:00:00');


INSERT IGNORE INTO results (email, score, moves, finished, played_at) VALUES
    
    ('alice@example.com', 2450, 48, 1, '2026-03-05 10:00:00'),
    ('alice@example.com', 2100, 55, 1, '2026-03-06 11:00:00'),
    ('alice@example.com',  900, 30, 0, '2026-03-07 12:00:00'),

    
    ('bob@test.com', 1950, 62, 1, '2026-03-05 14:00:00'),
    ('bob@test.com', 1600, 70, 1, '2026-03-06 15:00:00'),
    ('bob@test.com',  400, 20, 0, '2026-03-07 09:00:00'),

    
    ('carol@demo.org', 2800, 42, 1, '2026-03-04 08:00:00'),
    ('carol@demo.org', 2600, 44, 1, '2026-03-05 09:00:00'),
    ('carol@demo.org', 1200, 38, 0, '2026-03-06 10:00:00'),

    
    ('dave@play.net', 1750, 65, 1, '2026-03-05 16:00:00'),
    ('dave@play.net', 2050, 58, 1, '2026-03-06 17:00:00'),
    ('dave@play.net',  600, 25, 0, '2026-03-07 10:00:00'),

    
    ('eve@memory.io', 1300, 72, 1, '2026-03-06 12:00:00'),
    ('eve@memory.io',  750, 35, 0, '2026-03-07 13:00:00'),

    
    ('frank@match.ca', 1100, 80, 1, '2026-03-06 18:00:00'),
    ('frank@match.ca',  500, 28, 0, '2026-03-07 14:00:00');
