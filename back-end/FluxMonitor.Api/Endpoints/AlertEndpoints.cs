using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Dapper;
using FluxMonitor.Application.DTOs;
using FluxMonitor.Infrastructure.Data;

namespace FluxMonitor.Api.Endpoints;

public static class AlertEndpoints
{
    public static void MapAlertEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/alerts");
        group.MapGet("/", GetAlerts);
        group.MapPut("/{id:guid}/resolve", ResolveAlert);
        group.MapPut("/{id:guid}/reopen", ReopenAlert);
    }

    private static async Task<IResult> GetAlerts(string? status, string? severity, IDbConnectionFactory dbFactory)
    {
        using var connection = dbFactory.CreateConnection();
        
        var rawAlerts = await connection.QueryAsync<dynamic>(
            "sp_get_alerts", 
            new { p_Status = status?.ToLower(), p_Severity = severity?.ToLower() },
            commandType: System.Data.CommandType.StoredProcedure);

        var alerts = rawAlerts.Select(a => new AlertResponseDto
        {
            Key = a.Id.ToString(),
            FlowName = a.FlowName,
            AlertType = a.AlertType,
            Timestamp = ((DateTime)a.CreatedAt).ToString("yyyy-MM-dd HH:mm:ss"),
            Severity = a.Severity,
            Status = a.Status,
            Description = a.Description,
            // Parse do MySQL JSON string back to List<string>
            TriggeredAutomatedActions = string.IsNullOrEmpty(a.TriggeredAutomatedActions) 
                ? new System.Collections.Generic.List<string>()
                : JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(a.TriggeredAutomatedActions)
        }).ToList();

        return Results.Ok(alerts);
    }

    private static async Task<IResult> ResolveAlert(Guid id, IDbConnectionFactory dbFactory)
    {
        using var connection = dbFactory.CreateConnection();
        await connection.ExecuteAsync("sp_update_alert_status", new { p_Id = id.ToString(), p_Status = "resolved" }, commandType: System.Data.CommandType.StoredProcedure);
        return Results.Ok(new { success = true, message = "Alert resolved successfully." });
    }

    private static async Task<IResult> ReopenAlert(Guid id, IDbConnectionFactory dbFactory)
    {
        using var connection = dbFactory.CreateConnection();
        await connection.ExecuteAsync("sp_update_alert_status", new { p_Id = id.ToString(), p_Status = "active" }, commandType: System.Data.CommandType.StoredProcedure);
        return Results.Ok(new { success = true, message = "Alert re-opened successfully." });
    }
}