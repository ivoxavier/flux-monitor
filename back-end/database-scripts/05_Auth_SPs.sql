CREATE PROCEDURE sp_get_user_by_username(IN p_Username VARCHAR(100))
BEGIN
    
    SELECT Id, Username, PasswordHash, UserGroup, IsActive
    FROM Users
    WHERE Username = p_Username;
END 