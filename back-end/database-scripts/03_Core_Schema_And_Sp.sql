CREATE TABLE IF NOT EXISTS Manifests (
    Id CHAR(36) PRIMARY KEY,
    Name VARCHAR(150) NOT NULL,
    AssociatedFlow VARCHAR(150),
    FileType VARCHAR(20),
    IsActive BOOLEAN DEFAULT TRUE,
    ExecutionType VARCHAR(50),
    ExpectedFrequency VARCHAR(50),
    MaxExecutionTime VARCHAR(50),
    FileClass VARCHAR(100),
    DirectoryIn VARCHAR(255),
    DirectoryOut VARCHAR(255),
    SystemType VARCHAR(100),
    SchedulerMachine VARCHAR(100),
    AlertChannels JSON, -- Arrays guardados como JSON nativo no MySQL
    Recipients JSON,
    UpdatedAt DATETIME
);

CREATE TABLE IF NOT EXISTS Executions (
    Id CHAR(36) PRIMARY KEY,
    ManifestId CHAR(36),
    ManifestName VARCHAR(150),
    FlowName VARCHAR(150),
    StartTime DATETIME,
    DurationSeconds DOUBLE,
    Status VARCHAR(50),
    ErrorMessage TEXT,
    SystemType VARCHAR(100),
    ReceivedFilesCount INT,
    ProcessedFilesCount INT,
    HttpRequestsSentCount INT,
    HttpRequestsReceivedCount INT,
    Holding VARCHAR(100),
    Client VARCHAR(100),
    Department VARCHAR(100),
    Section VARCHAR(100),
    SourceSystem VARCHAR(100),
    TargetSystem VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Alerts (
    Id CHAR(36) PRIMARY KEY,
    ManifestId CHAR(36),
    FlowName VARCHAR(150),
    AlertType VARCHAR(100),
    Severity VARCHAR(50),
    Status VARCHAR(50),
    Description TEXT,
    TriggeredAutomatedActions JSON,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. STORED PROCEDURES
-- ==========================================

-- ALERTS -------------------------
CREATE PROCEDURE sp_get_alerts(IN p_Status VARCHAR(50), IN p_Severity VARCHAR(50))
BEGIN
    SELECT * FROM Alerts 
    WHERE (p_Status IS NULL OR p_Status = 'all' OR Status = p_Status)
      AND (p_Severity IS NULL OR p_Severity = 'all' OR Severity = p_Severity)
    ORDER BY CreatedAt DESC;
END 

CREATE PROCEDURE sp_update_alert_status(IN p_Id CHAR(36), IN p_Status VARCHAR(50))
BEGIN
    UPDATE Alerts SET Status = p_Status WHERE Id = p_Id;
END 

CREATE PROCEDURE sp_insert_alert(
    IN p_Id CHAR(36), IN p_ManifestId CHAR(36), IN p_FlowName VARCHAR(150),
    IN p_AlertType VARCHAR(100), IN p_Severity VARCHAR(50), IN p_Status VARCHAR(50),
    IN p_Description TEXT, IN p_TriggeredAutomatedActions JSON
)
BEGIN
    INSERT INTO Alerts (Id, ManifestId, FlowName, AlertType, Severity, Status, Description, TriggeredAutomatedActions, CreatedAt)
    VALUES (p_Id, p_ManifestId, p_FlowName, p_AlertType, p_Severity, p_Status, p_Description, p_TriggeredAutomatedActions, UTC_TIMESTAMP());
END 

-- MANIFESTS ----------------------
CREATE PROCEDURE sp_get_manifests(IN p_Status VARCHAR(50))
BEGIN
    SELECT * FROM Manifests 
    WHERE (p_Status IS NULL OR p_Status = 'all' OR 
          (p_Status = 'enabled' AND IsActive = 1) OR 
          (p_Status = 'disabled' AND IsActive = 0))
    ORDER BY UpdatedAt DESC;
END 

CREATE PROCEDURE sp_get_manifest_by_id(IN p_Id CHAR(36))
BEGIN
    SELECT * FROM Manifests WHERE Id = p_Id;
END 

CREATE PROCEDURE sp_get_manifest_by_name(IN p_Name VARCHAR(150))
BEGIN
    SELECT * FROM Manifests WHERE LOWER(Name) = LOWER(p_Name);
END

CREATE PROCEDURE sp_delete_manifest(IN p_Id CHAR(36))
BEGIN
    DELETE FROM Manifests WHERE Id = p_Id;
END 

-- EXECUTIONS -----
CREATE PROCEDURE sp_get_executions(
    IN p_Status VARCHAR(50), IN p_StartDate DATETIME, IN p_EndDate DATETIME, IN p_Limit INT
)
BEGIN
    SELECT * FROM Executions
    WHERE (p_Status IS NULL OR p_Status = 'all' OR Status = p_Status)
      AND (p_StartDate IS NULL OR StartTime >= p_StartDate)
      AND (p_EndDate IS NULL OR StartTime <= p_EndDate)
    ORDER BY StartTime DESC
    LIMIT p_Limit;
END 

CREATE PROCEDURE sp_get_running_execution(IN p_ManifestId CHAR(36))
BEGIN
    SELECT * FROM Executions WHERE ManifestId = p_ManifestId AND Status = 'running' ORDER BY StartTime DESC LIMIT 1;
END


CREATE PROCEDURE sp_get_dashboard_analytics(IN p_TargetDate DATETIME)
BEGIN
    -- Result 1: Widgets
    SELECT 
        (SELECT COUNT(*) FROM Executions WHERE DATE(StartTime) = DATE(p_TargetDate)) AS ExecutedToday,
        (SELECT IFNULL(SUM(ProcessedFilesCount), 0) FROM Executions WHERE DATE(StartTime) = DATE(p_TargetDate)) AS ProcessedFiles,
        (SELECT IFNULL(SUM(HttpRequestsSentCount), 0) FROM Executions WHERE DATE(StartTime) = DATE(p_TargetDate)) AS HttpSent,
        (SELECT IFNULL(SUM(HttpRequestsReceivedCount), 0) FROM Executions WHERE DATE(StartTime) = DATE(p_TargetDate)) AS HttpReceived,
        (SELECT COUNT(*) FROM Executions WHERE DATE(StartTime) = DATE(p_TargetDate) AND Status = 'failed') AS FlowsError,
        (SELECT COUNT(*) FROM Alerts WHERE Status = 'active') AS ActiveAlerts;

    -- Result 2: Hourly Trend (Bruto, o C# agrupa em janelas de 4h)
    SELECT HOUR(StartTime) AS HourOfDay, Status 
    FROM Executions 
    WHERE DATE(StartTime) = DATE(p_TargetDate);
END