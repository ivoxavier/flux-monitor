using FluxMonitor.Infrastructure.Data;
using FluxMonitor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FluxMonitor.Api.Endpoints;

public static class SettingsEndpoints
{
    public static void MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/settings");

        group.MapGet("/", GetSettingsAsync);
        group.MapPost("/", SaveSettingsAsync);
    }

    private static async Task<IResult> GetSettingsAsync(FluxMonitorDbContext db)
    {
        // Get global OR creates ONE
        var settings = await db.SystemSettings.FirstOrDefaultAsync(s => s.Id == 1);
        if (settings == null)
        {
            return Results.NotFound("System Configs not Initialized");
        }
        return Results.Ok(settings);
    }

    private static async Task<IResult> SaveSettingsAsync(SystemSettings updatedSettings, FluxMonitorDbContext db)
    {
        var currentSettings = await db.SystemSettings.FirstOrDefaultAsync(s => s.Id == 1);
        
        if (currentSettings == null)
        {
            // Fallback
            updatedSettings.Id = 1;
            await db.SystemSettings.AddAsync(updatedSettings);
        }
        else
        {
            
            currentSettings.ClientCompany = updatedSettings.ClientCompany;
            currentSettings.EnableGlobalErrorActions = updatedSettings.EnableGlobalErrorActions;
            currentSettings.SendEmailOnFailure = updatedSettings.SendEmailOnFailure;
            currentSettings.TriggerWebhookOnFailure = updatedSettings.TriggerWebhookOnFailure;
            currentSettings.CleanLogs = updatedSettings.CleanLogs;
            currentSettings.LogsRetentionDays = updatedSettings.LogsRetentionDays;
            currentSettings.CleanManifests = updatedSettings.CleanManifests;
            currentSettings.ManifestsRetentionDays = updatedSettings.ManifestsRetentionDays;
        }

        await db.SaveChangesAsync();
        return Results.Ok(new { message = "Configurações gravadas com sucesso!" });
    }
}