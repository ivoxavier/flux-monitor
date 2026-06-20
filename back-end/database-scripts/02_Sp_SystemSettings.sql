CREATE PROCEDURE sp_get_settings()
BEGIN
    SELECT 
        Id, ClientCompany, EnableGlobalErrorActions, SendEmailOnFailure, 
        TriggerWebhookOnFailure, CleanLogs, LogsRetentionDays, 
        CleanManifests, ManifestsRetentionDays
    FROM SystemSettings 
    WHERE Id = 1;
END


CREATE PROCEDURE sp_save_settings(
    IN p_ClientCompany VARCHAR(255),
    IN p_EnableGlobalErrorActions BOOLEAN,
    IN p_SendEmailOnFailure BOOLEAN,
    IN p_TriggerWebhookOnFailure BOOLEAN,
    IN p_CleanLogs BOOLEAN,
    IN p_LogsRetentionDays INT,
    IN p_CleanManifests BOOLEAN,
    IN p_ManifestsRetentionDays INT
)
BEGIN
    INSERT INTO SystemSettings (
        Id, ClientCompany, EnableGlobalErrorActions, SendEmailOnFailure, 
        TriggerWebhookOnFailure, CleanLogs, LogsRetentionDays, 
        CleanManifests, ManifestsRetentionDays
    ) VALUES (
        1, p_ClientCompany, p_EnableGlobalErrorActions, p_SendEmailOnFailure, 
        p_TriggerWebhookOnFailure, p_CleanLogs, p_LogsRetentionDays, 
        p_CleanManifests, p_ManifestsRetentionDays
    )
    ON DUPLICATE KEY UPDATE 
        ClientCompany = p_ClientCompany,
        EnableGlobalErrorActions = p_EnableGlobalErrorActions,
        SendEmailOnFailure = p_SendEmailOnFailure,
        TriggerWebhookOnFailure = p_TriggerWebhookOnFailure,
        CleanLogs = p_CleanLogs,
        LogsRetentionDays = p_LogsRetentionDays,
        CleanManifests = p_CleanManifests,
        ManifestsRetentionDays = p_ManifestsRetentionDays;
END 