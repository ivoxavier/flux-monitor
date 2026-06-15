using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using FluxMonitor.Application.DTOs;
using FluxMonitor.Infrastructure.Data;
using FluxMonitor.Domain.Entities;

namespace FluxMonitor.Api.Endpoints;

public static class AlertEndpoints
{
    public static void MapAlertEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/alerts");

        group.MapGet("/", GetAlertsAsync);
        group.MapPut("/{id:guid}/resolve", ResolveAlertAsync);
        group.MapPut("/{id:guid}/reopen", ReopenAlertAsync);
    }

    private static async Task<IResult> GetAlertsAsync(
        string? status, 
        string? severity, 
        FluxMonitorDbContext db)
    {
        var query = db.Alerts.AsQueryable();

        if (!string.IsNullOrEmpty(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(a => a.Status == status.ToLower());
        }

     
        if (!string.IsNullOrEmpty(severity) && !severity.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(a => a.Severity == severity.ToLower());
        }

        var alerts = await query
            .OrderByDescending(a => a.Id)
            .Select(a => new AlertResponseDto
            {
                Key = a.Id.ToString(),
                FlowName = a.FlowName,
                AlertType = a.AlertType,
                Timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"), 
                Severity = a.Severity.ToLower(),
                Status = a.Status.ToLower(),
                Description = a.Description,
                TriggeredAutomatedActions = a.TriggeredAutomatedActions.ToList()
            })
            .ToListAsync();

        return Results.Ok(alerts);
    }

    private static async Task<IResult> ResolveAlertAsync(Guid id, FluxMonitorDbContext db)
    {
        var alert = await db.Alerts.FindAsync(id);
        if (alert == null) return Results.NotFound("Target infrastructure operational alert record not found.");

        alert.Status = "resolved";
        await db.SaveChangesAsync();

        return Results.Ok(new { success = true, message = "Alert status marked as resolved successfully." });
    }

    private static async Task<IResult> ReopenAlertAsync(Guid id, FluxMonitorDbContext db)
    {
        var alert = await db.Alerts.FindAsync(id);
        if (alert == null) return Results.NotFound("Target infrastructure operational alert record not found.");

        alert.Status = "active";
        await db.SaveChangesAsync();

        return Results.Ok(new { success = true, message = "Alert context re-opened for engineering analysis." });
    }
}