using System;
using System.Linq;
using System.Data;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Dapper;
using FluxMonitor.Application.DTOs;
using FluxMonitor.Infrastructure.Data;

namespace FluxMonitor.Api.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/users");

            group.MapGet("/", GetUsers);
            group.MapPost("/", CreateUser);
            group.MapPut("/{id:guid}", UpdateUser);
            group.MapDelete("/{id:guid}", ToggleUserStatus);
            group.MapPost("/{id:guid}/reset-password", ResetPassword);
        }

        private static async Task<IResult> GetUsers(string? role, string? status, IDbConnectionFactory dbFactory)
        {
            using var connection = dbFactory.CreateConnection();

            string? roleFilter = (string.IsNullOrEmpty(role) || role.Equals("all", StringComparison.OrdinalIgnoreCase)) ? null : role;
            bool? isActiveFilter = null;
            
            if (!string.IsNullOrEmpty(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                isActiveFilter = status.Equals("enabled", StringComparison.OrdinalIgnoreCase);
            }

            var rawUsers = await connection.QueryAsync<dynamic>(
                "sp_get_users", 
                new { p_Role = roleFilter, p_IsActive = isActiveFilter },
                commandType: CommandType.StoredProcedure);

            var users = rawUsers.Select(u => new
            {
                Key = u.Id.ToString(),
                Name = u.Username, 
                Username = u.Username,
                Email = u.Email,
                Role = u.UserGroup,
                Holding = u.Holding,
                Section = u.Section,
                Center = u.Center, 
                Status = Convert.ToBoolean(u.IsActive) ? "enabled" : "disabled",
                LastLogin = ((DateTime)u.CreatedAt).ToString("yyyy-MM-dd HH:mm:ss")
            }).ToList();

            return Results.Ok(users);
        }

        private static async Task<IResult> CreateUser(CreateUserDto dto, IDbConnectionFactory dbFactory)
        {
            using var connection = dbFactory.CreateConnection();

            var result = await connection.QuerySingleAsync<dynamic>(
                "sp_create_user", 
                new 
                {
                    p_Id = Guid.NewGuid().ToString(),
                    p_Username = dto.Username,
                    p_Email = dto.Email,
                    p_PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    p_UserGroup = dto.Role,
                    p_Holding = dto.Holding,
                    p_Section = dto.Section,
                    p_Center = dto.Center,
                    p_IsActive = dto.IsActive
                },
                commandType: CommandType.StoredProcedure);

        
            if (result.Success == 0)
            {
                return Results.BadRequest((string)result.Message);
            }

            return Results.StatusCode(StatusCodes.Status201Created);
        }

        private static async Task<IResult> UpdateUser(Guid id, UpdateUserDto dto, IDbConnectionFactory dbFactory)
        {
            using var connection = dbFactory.CreateConnection();

            await connection.ExecuteAsync(
                "sp_update_user", 
                new 
                {
                    p_Id = id.ToString(),
                    p_Username = dto.Username,
                    p_Email = dto.Email,
                    p_UserGroup = dto.Role,
                    p_Holding = dto.Holding,
                    p_Section = dto.Section,
                    p_Center = dto.Center,
                    p_IsActive = dto.IsActive
                },
                commandType: CommandType.StoredProcedure);

            return Results.Ok();
        }

        private static async Task<IResult> ToggleUserStatus(Guid id, IDbConnectionFactory dbFactory)
        {
            using var connection = dbFactory.CreateConnection();

            
            var newStatus = await connection.ExecuteScalarAsync<bool?>(
                "sp_toggle_user_status", 
                new { p_Id = id.ToString() },
                commandType: CommandType.StoredProcedure);

            if (newStatus == null) return Results.NotFound("User not found.");

            return Results.Ok(new { status = newStatus.Value ? "active" : "inactive" });
        }

        private static async Task<IResult> ResetPassword(Guid id, IDbConnectionFactory dbFactory)
        {
            using var connection = dbFactory.CreateConnection();

            string newHash = BCrypt.Net.BCrypt.HashPassword("Password123");

            await connection.ExecuteAsync(
                "sp_reset_user_password", 
                new { p_Id = id.ToString(), p_PasswordHash = newHash },
                commandType: CommandType.StoredProcedure);

            return Results.Ok(new { message = "Password successfully reset to default: Password123" });
        }
    }
}