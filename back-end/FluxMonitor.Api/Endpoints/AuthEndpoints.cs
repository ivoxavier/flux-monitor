using BCrypt.Net;
using FluxMonitor.Application.DTOs;
using FluxMonitor.Application.Interfaces;
using FluxMonitor.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FluxMonitor.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        // group all auth 
        var group = app.MapGroup("/api/auth");

        group.MapPost("/login", LoginAsync);
        //future endPonts
        // group.MapPost("/logout", LogoutAsync);
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest request, 
        FluxMonitorDbContext db, 
        IJwtTokenGenerator jwtGenerator)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null) return Results.BadRequest("Wrong Credentials.");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid) return Results.BadRequest("Wrong Credentials.");

        if (!user.IsActive) return Results.Forbid();

        var token = jwtGenerator.GenerateToken(user);

        return Results.Ok(new LoginResponse(token, user.Username, user.UserGroup));
    }
}