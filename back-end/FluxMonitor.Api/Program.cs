using FluxMonitor.Api.Endpoints;
using FluxMonitor.Application.Interfaces;
using FluxMonitor.Infrastructure.Authentication;
using FluxMonitor.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql;


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


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<FluxMonitorDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

builder.Services.AddCors(options => options.AddDefaultPolicy(policy => 
    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

app.UseCors();

// registor the endpoints
app.MapAuthEndpoints(); 


app.Run();