using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using FluxMonitor.Infrastructure.Data;

namespace FluxMonitor.Api.Endpoints;

public static class AlertEndpoints
{
    public static void MapAlertEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/alerts");
        group.MapGet("/", GetAlertsAsync);
        group.MapPut("/{id:guid}/status", UpdateAlertStatusAsync);
    }

    private static async Task<IResult> GetAlertsAsync(string? status, string? severity, FluxMonitorDbContext db)
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
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                Key = a.Id.ToString(),
                Flow = a.FlowName,
                AlertType = a.AlertType,
                DataHora = a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                Severidade = a.Severity,
                Estado = a.Status,
                Descricao = a.Description,
                AcoesAutomatizadas = a.TriggeredAutomatedActions
            })
            .ToListAsync();

        return Results.Ok(alerts);
    }

    private static async Task<IResult> UpdateAlertStatusAsync(Guid id, string status, FluxMonitorDbContext db)
    {
        var alert = await db.Alerts.FindAsync(id);
        if (alert == null) return Results.NotFound("Alert not found.");

        alert.Status = status.ToLower() == "resolved" ? "resolved" : "active";
        await db.SaveChangesAsync();
        return Results.Ok();
    }
}