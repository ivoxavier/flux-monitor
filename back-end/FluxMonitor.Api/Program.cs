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

builder.Services.AddDbContext<FluxMonitorDbContext>(options =>
    options.UseMySQL(
        connectionString ?? string.Empty,
        b => b.MigrationsAssembly("FluxMonitor.Infrastructure")
    ));


builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();


var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"] 
                     ?? Environment.GetEnvironmentVariable("Cors__AllowedOrigins") 
                     ?? "http://localhost:3000";

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
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

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<FluxMonitorDbContext>();
    var logger = services.GetRequiredService<ILogger<Program>>();


    int maxRetries = 5;
    int delayInSeconds = 5;

    for (int i = 1; i <= maxRetries; i++)
    {
        try
        {
            logger.LogInformation("Try making Migrations (Try {Run}/{Max})...", i, maxRetries);
            context.Database.Migrate();
            logger.LogInformation("DataBase Migrated and ready!");
            break;
        }
        catch (Exception ex)
        {
            logger.LogWarning("O MySQL is not ready. Waiting {Delay} seconds...", delayInSeconds);
            if (i == maxRetries)
            {
                logger.LogError(ex, "Error : Was not possible to apply migrations.");
                throw;
            }
            Thread.Sleep(delayInSeconds * 1000);
        }
    }
}

app.UseCors();

// registor the endpoints
app.MapAuthEndpoints(); 
app.MapSettingsEndpoints();
app.MapUserEndpoints();
app.MapManifestEndpoints();


app.Run();