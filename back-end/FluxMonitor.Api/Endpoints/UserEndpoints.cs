using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using FluxMonitor.Application.DTOs;
using FluxMonitor.Domain.Entities;
using FluxMonitor.Infrastructure.Data;

namespace FluxMonitor.Api.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/users");

            group.MapGet("/", GetUsersAsync);
            group.MapPost("/", CreateUserAsync);
            group.MapPut("/{id:guid}", UpdateUserAsync);
            group.MapDelete("/{id:guid}", ToggleUserStatusAsync);
            group.MapPost("/{id:guid}/reset-password", ResetPasswordAsync);
        }

        private static async Task<IResult> GetUsersAsync(string? role, string? status, FluxMonitorDbContext db)
{
    var query = db.Users.AsQueryable();

    
    if (!string.IsNullOrEmpty(role) && !role.Equals("all", StringComparison.OrdinalIgnoreCase))
    {
        query = query.Where(u => u.UserGroup == role);
    }

  
    if (!string.IsNullOrEmpty(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
    {
        bool isActiveFilter = status.Equals("enabled", StringComparison.OrdinalIgnoreCase);
        query = query.Where(u => u.IsActive == isActiveFilter);
    }

    var users = await query
        .OrderByDescending(u => u.CreatedAt)
        .Select(u => new
        {
            Key = u.Id.ToString(),
            Name = u.Username, 
            Username = u.Username,
            Email = u.Email,
            Role = u.UserGroup,
            Status = u.IsActive ? "enabled" : "disabled",
            LastLogin = u.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
        })
        .ToListAsync();

            return Results.Ok(users);
        }

        private static async Task<IResult> CreateUserAsync(CreateUserDto dto, FluxMonitorDbContext db)
        {
            if (await db.Users.AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email))
            {
                return Results.BadRequest("Username or Email already registered.");
            }

            var newUser = new Users
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                UserGroup = dto.Role,
                IsActive = dto.IsActive, 
                CreatedAt = DateTime.UtcNow
            };

            await db.Users.AddAsync(newUser);
            await db.SaveChangesAsync();

            return Results.StatusCode(StatusCodes.Status201Created);
        }

        private static async Task<IResult> UpdateUserAsync(Guid id, UpdateUserDto dto, FluxMonitorDbContext db)
        {
            var user = await db.Users.FindAsync(id);
            if (user == null) return Results.NotFound("User not found.");

            user.Email = dto.Email;
            user.Username = dto.Username;
            user.UserGroup = dto.Role;
            user.IsActive = dto.IsActive;  

            await db.SaveChangesAsync();
            return Results.Ok();
        }

        private static async Task<IResult> ToggleUserStatusAsync(Guid id, FluxMonitorDbContext db)
        {
            var user = await db.Users.FindAsync(id);
            if (user == null) return Results.NotFound("User not found.");

            user.IsActive = !user.IsActive;
            
            await db.SaveChangesAsync();
            return Results.Ok(new { status = user.IsActive ? "active" : "inactive" });
        }

        private static async Task<IResult> ResetPasswordAsync(Guid id, FluxMonitorDbContext db)
        {
            var user = await db.Users.FindAsync(id);
            if (user == null) return Results.NotFound("User not found.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123");
            
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Password successfully reset to default: Password123" });
        }
    }
}