using System;
using System.Data;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Dapper;
using BCrypt.Net;
using FluxMonitor.Application.DTOs;
using FluxMonitor.Application.Interfaces;
using FluxMonitor.Infrastructure.Data;
using FluxMonitor.Application.Entities;

namespace FluxMonitor.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        // Agrupa todas as rotas de auth
        var group = app.MapGroup("/api/auth");

        group.MapPost("/login", Login);
    
    }

    private static async Task<IResult> Login(
        LoginRequest request, 
        IDbConnectionFactory dbFactory, 
        IJwtTokenGenerator jwtGenerator)
    {
        using var connection = dbFactory.CreateConnection();

        
        var user = await connection.QueryFirstOrDefaultAsync<Users>(
            "sp_get_user_by_username",
            new { p_Username = request.Username },
            commandType: CommandType.StoredProcedure
        );

        if (user == null) return Results.BadRequest("Wrong Credentials.");

    
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        
        
        if (!isPasswordValid) return Results.BadRequest("Wrong Credentials.");

        
        if (!user.IsActive) return Results.Forbid();

        
        var token = jwtGenerator.GenerateToken(user);

        return Results.Ok(new LoginResponse(token, user.Username, user.UserGroup));
    }
}