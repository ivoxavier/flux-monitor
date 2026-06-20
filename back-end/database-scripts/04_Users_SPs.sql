
CREATE PROCEDURE sp_get_users(IN p_Role VARCHAR(50), IN p_IsActive BOOLEAN)
BEGIN
    SELECT * FROM Users
    WHERE (p_Role IS NULL OR p_Role = 'all' OR UserGroup = p_Role)
      AND (p_IsActive IS NULL OR IsActive = p_IsActive)
    ORDER BY CreatedAt DESC;
END


CREATE PROCEDURE sp_create_user(
    IN p_Id CHAR(36), 
    IN p_Username VARCHAR(100), 
    IN p_Email VARCHAR(255),
    IN p_PasswordHash VARCHAR(255), 
    IN p_UserGroup VARCHAR(50), 
    IN p_IsActive BOOLEAN
)
BEGIN
    DECLARE v_Exists INT;
    SELECT COUNT(1) INTO v_Exists FROM Users WHERE Username = p_Username OR Email = p_Email;

    IF v_Exists > 0 THEN
        
        SELECT 0 AS Success, 'Username or Email already registered.' AS Message;
    ELSE
        INSERT INTO Users (Id, Username, Email, PasswordHash, UserGroup, IsActive, CreatedAt)
        VALUES (p_Id, p_Username, p_Email, p_PasswordHash, p_UserGroup, p_IsActive, UTC_TIMESTAMP());
        
        
        SELECT 1 AS Success, 'User created successfully.' AS Message;
    END IF;
END 


CREATE PROCEDURE sp_update_user(
    IN p_Id CHAR(36), 
    IN p_Username VARCHAR(100), 
    IN p_Email VARCHAR(255),
    IN p_UserGroup VARCHAR(50), 
    IN p_IsActive BOOLEAN
)
BEGIN
    UPDATE Users
    SET Username = p_Username, Email = p_Email, UserGroup = p_UserGroup, IsActive = p_IsActive
    WHERE Id = p_Id;
END 


CREATE PROCEDURE sp_toggle_user_status(IN p_Id CHAR(36))
BEGIN
    UPDATE Users SET IsActive = NOT IsActive WHERE Id = p_Id;
    
    SELECT IsActive FROM Users WHERE Id = p_Id;
END 


CREATE PROCEDURE sp_reset_user_password(IN p_Id CHAR(36), IN p_PasswordHash VARCHAR(255))
BEGIN
    UPDATE Users SET PasswordHash = p_PasswordHash WHERE Id = p_Id;
END 