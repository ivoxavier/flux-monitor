using FluxMonitor.Api.Endpoints;
using FluxMonitor.Application.Interfaces;
using FluxMonitor.Infrastructure.Authentication;
using FluxMonitor.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;


if (Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") != "true")
{
    var currentDir = new DirectoryInfo(AppContext.BaseDirectory);
    string? envPath = null;

    while (currentDir != null)
    {
        var potentialFile = Path.Combine(currentDir.FullName, ".env.local");
        if (File.Exists(potentialFile))
        {
            envPath = potentialFile;
            break;
        }
        currentDir = currentDir.Parent;
    }

    if (envPath != null)
    {
        DotNetEnv.Env.Load(envPath);
    }
}


var builder = WebApplication.CreateBuilder(args);



var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

// --- DESIGN-TIME (MIGRATIONS) ---
if (string.IsNullOrEmpty(connectionString) && EF.IsDesignTime)
{
    // fake connectionString to bypass
    connectionString = "Server=localhost;Database=fluxmonitor_db;Uid=root;Pwd=root;";
}

if (string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("MySQL connectionString is empty!");
}


builder.Services.AddSingleton<IDbConnectionFactory, MySqlDbConnectionFactory>();


builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();


var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"] 
                     ?? Environment.GetEnvironmentVariable("Cors__AllowedOrigins") 
                     ?? "http://localhost:3000";

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000","http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "FluxMonitor API v1");
    options.RoutePrefix = string.Empty; // make swagger open on (http://localhost:5001)
});


app.UseCors();

// registor the endpoints
app.MapAuthEndpoints(); 
app.MapSettingsEndpoints();
app.MapUserEndpoints();
app.MapManifestEndpoints();
app.MapAlertEndpoints();
app.MapExecutionEndpoints();

app.Run();