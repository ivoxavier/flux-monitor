using System.Data;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Dapper;
using FluxMonitor.Infrastructure.Data;
using FluxMonitor.Application.Entities;

namespace FluxMonitor.Api.Endpoints;

public static class SettingsEndpoints
{
    public static void MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/settings");

        group.MapGet("/", GetSettings);
        group.MapPost("/", SaveSettings);
        group.MapGet("/brand", GetBrandConfig);
    }

    private static async Task<IResult> GetSettings(IDbConnectionFactory dbFactory)
    {
        using var connection = dbFactory.CreateConnection();
        
        var settings = await connection.QueryFirstOrDefaultAsync<SystemSettings>(
            "sp_get_settings", 
            commandType: CommandType.StoredProcedure);

        if (settings == null)
        {
            return Results.NotFound("System Configs not Initialized.");
        }
        
        return Results.Ok(settings);
    }

    private static async Task<IResult> SaveSettings(SystemSettings updatedSettings, IDbConnectionFactory dbFactory)
    {
        using var connection = dbFactory.CreateConnection();

        
        var parameters = new DynamicParameters();
        parameters.Add("p_ClientCompany", updatedSettings.ClientCompany);
        parameters.Add("p_EnableGlobalErrorActions", updatedSettings.EnableGlobalErrorActions);
        parameters.Add("p_SendEmailOnFailure", updatedSettings.SendEmailOnFailure);
        parameters.Add("p_TriggerWebhookOnFailure", updatedSettings.TriggerWebhookOnFailure);
        parameters.Add("p_CleanLogs", updatedSettings.CleanLogs);
        parameters.Add("p_LogsRetentionDays", updatedSettings.LogsRetentionDays);
        parameters.Add("p_CleanManifests", updatedSettings.CleanManifests);
        parameters.Add("p_ManifestsRetentionDays", updatedSettings.ManifestsRetentionDays);

        await connection.ExecuteAsync(
            "sp_save_settings", 
            parameters, 
            commandType: CommandType.StoredProcedure);

        return Results.Ok(new { message = "Settings Saved!" });
    }

    private static async Task<IResult> GetBrandConfig(IDbConnectionFactory dbFactory)
    {
        using var connection = dbFactory.CreateConnection();

        
        var settings = await connection.QueryFirstOrDefaultAsync<SystemSettings>(
            "sp_get_settings", 
            commandType: CommandType.StoredProcedure);

        return Results.Ok(new
        {
            ClientCompany = settings?.ClientCompany ?? "Default Company",
            SystemName = "FluxMonitor"
        });
    }
}