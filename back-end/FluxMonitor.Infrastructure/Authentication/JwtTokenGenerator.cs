using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FluxMonitor.Application.Interfaces;
using FluxMonitor.Application.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FluxMonitor.Infrastructure.Authentication;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(Users user)
{
    var tokenHandler = new JwtSecurityTokenHandler();
    
    
    var secretKey = _configuration["Jwt:Key"] 
                    ?? Environment.GetEnvironmentVariable("Jwt__Key")
                    ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY");

    
    if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 16)
    {
        secretKey = "ChaveSuperSecretaECompridaDoFluxMonitor2026!";
    }

    var key = Encoding.UTF8.GetBytes(secretKey);

    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.UserGroup)
        }),
        Expires = DateTime.UtcNow.AddHours(8),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
        Issuer = _configuration["Jwt:Issuer"] ?? _configuration["Jwt__Issuer"],
        Audience = _configuration["Jwt:Audience"] ?? _configuration["Jwt__Audience"]
    };

    var token = tokenHandler.CreateToken(tokenDescriptor);
    return tokenHandler.WriteToken(token);
}
}