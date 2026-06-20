CREATE DATABASE IF NOT EXISTS fluxmonitor_db;
CREATE DATABASE IF NOT EXISTS fluxmonitor_db_dev;


CREATE TABLE IF NOT EXISTS SystemSettings (
    Id INT PRIMARY KEY,
    ClientCompany VARCHAR(255) NOT NULL,
    EnableGlobalErrorActions BOOLEAN NOT NULL DEFAULT FALSE,
    SendEmailOnFailure BOOLEAN NOT NULL DEFAULT FALSE,
    TriggerWebhookOnFailure BOOLEAN NOT NULL DEFAULT FALSE,
    CleanLogs BOOLEAN NOT NULL DEFAULT FALSE,
    LogsRetentionDays INT NOT NULL DEFAULT 30,
    CleanManifests BOOLEAN NOT NULL DEFAULT FALSE,
    ManifestsRetentionDays INT NOT NULL DEFAULT 90
);

INSERT IGNORE INTO SystemSettings (Id, ClientCompany) VALUES (1, 'Default Company');


CREATE TABLE IF NOT EXISTS Users (
    Id CHAR(36) PRIMARY KEY,
    Username VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    UserGroup VARCHAR(50) NOT NULL, -- Mapeia o teu 'userGroup' ou 'Role' (ex: admin, developer, monitor)
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Restrições de integridade para evitar duplicados diretamente no motor MySQL
    CONSTRAINT UQ_Users_Username UNIQUE (Username),
    CONSTRAINT UQ_Users_Email UNIQUE (Email)
);

-- Índices otimizados para acelerar a Stored Procedure de Login (sp_GetUserByUsername)
CREATE INDEX IX_Users_Username ON Users (Username);



INSERT IGNORE INTO Users (Id, Username, Email, PasswordHash, UserGroup, IsActive, CreatedAt)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 
    'admin', 
    'admin@email', 
    '$2a$11$mC/V8TszwU.x4.L8Y6A8DuZ2gXgGveiGkXhB6H9VepqT1W8bUHe72', -- Hash BCrypt de 'admin123'
    'admin', 
    1, 
    UTC_TIMESTAMP()
);