using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using FluxMonitor.Application.DTOs;
using FluxMonitor.Domain.Entities;
using FluxMonitor.Infrastructure.Data;

namespace FluxMonitor.Api.Endpoints;

public static class ExecutionEndpoints
{
    public static void MapExecutionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/executions");

        group.MapPost("/ingest", IngestExecutionTelemetryAsync);
        group.MapGet("/", GetExecutionsAsync);
    }

    private static async Task<IResult> GetExecutionsAsync(string? status, int? limit, FluxMonitorDbContext db)
    {
        var query = db.Executions.AsQueryable();

        if (!string.IsNullOrEmpty(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(e => e.Status == status.ToLower());
        }

        var executions = await query
            .OrderByDescending(e => e.StartTime)
            .Take(limit ?? 50)
            .Select(e => new
            {
                Key = e.Id.ToString(),
                ManifestName = e.ManifestName, 
                FlowName = e.FlowName,
                Timestamp = e.StartTime.ToString("yyyy-MM-dd HH:mm:ss"),
                Duration = e.DurationSeconds,
                Status = e.Status,
                Error = e.ErrorMessage,
                System = e.SystemType,
                ReceivedFiles = e.ReceivedFilesCount ?? 0,
                ProcessedFiles = e.ProcessedFilesCount ?? 0,
                HttpSent = e.HttpRequestsSentCount ?? 0,
                HttpReceived = e.HttpRequestsReceivedCount ?? 0,
                Holding = e.Holding ?? "N/A",
                Client = e.Client ?? "N/A",
                Department = e.Department ?? "N/A",
                Section = e.Section ?? "N/A",
                SourceSystem = e.SourceSystem ?? "N/A",
                TargetSystem = e.TargetSystem ?? "N/A"
            })
            .ToListAsync();

        return Results.Ok(executions);
    }

    private static async Task<IResult> IngestExecutionTelemetryAsync(ExecutionIngestDto dto, FluxMonitorDbContext db)
    {
        var manifest = await db.Manifests.FindAsync(dto.ManifestId);
        if (manifest == null) return Results.NotFound("Associated EDI Manifest unique ID not found.");

        var executionRecord = new Execution
        {
            Id = Guid.NewGuid(),
            ManifestId = manifest.Id,
            ManifestName = dto.ManifestName, 
            FlowName = manifest.AssociatedFlow,
            StartTime = DateTime.UtcNow,
            DurationSeconds = dto.ExecutionTimeSeconds,
            Status = dto.Status.ToLower(),
            ErrorMessage = dto.ErrorMessage,
            SystemType = manifest.SystemType ?? "Unknown",
            ReceivedFilesCount = dto.ReceivedFilesCount,
            ProcessedFilesCount = dto.ProcessedFilesCount,
            HttpRequestsSentCount = dto.HttpRequestsSentCount,
            HttpRequestsReceivedCount = dto.HttpRequestsReceivedCount,
            Holding = dto.Holding,
            Client = dto.Client,
            Department = dto.Department,
            Section = dto.Section,
            SourceSystem = dto.SourceSystem,
            TargetSystem = dto.TargetSystem
        };

        await db.Executions.AddAsync(executionRecord);

        bool alertTriggered = false;
        string alertReason = string.Empty;

        if (dto.Status.Equals("failed", StringComparison.OrdinalIgnoreCase))
        {
            var failedAlert = new Alert
            {
                Id = Guid.NewGuid(),
                ManifestId = manifest.Id,
                FlowName = manifest.AssociatedFlow,
                AlertType = "Execution Failure",
                Severity = "critical",
                Status = "active",
                Description = dto.ErrorMessage ?? $"The integration job [{dto.ManifestName}] stopped abruptly.",
                TriggeredAutomatedActions = manifest.AlertChannels.ToList()
            };
            await db.Alerts.AddAsync(failedAlert);
            alertTriggered = true;
            alertReason = "Pipeline reported an error status.";
        }
        else if (dto.Status.Equals("success", StringComparison.OrdinalIgnoreCase))
        {
            double maxAllowedSeconds = ParseFrequencyToSeconds(manifest.MaxExecutionTime);

            if (maxAllowedSeconds > 0 && dto.ExecutionTimeSeconds > maxAllowedSeconds)
            {
                var slaAlert = new Alert
                {
                    Id = Guid.NewGuid(),
                    ManifestId = manifest.Id,
                    FlowName = manifest.AssociatedFlow,
                    AlertType = "SLA Exceeded",
                    Severity = "warning",
                    Status = "active",
                    Description = $"Execution took {dto.ExecutionTimeSeconds}s, exceeding the defined threshold of {manifest.MaxExecutionTime} for this instance.",
                    TriggeredAutomatedActions = manifest.AlertChannels.Contains("Web Panel") ? new List<string> { "Web Panel" } : new List<string>()
                };
                await db.Alerts.AddAsync(slaAlert);
                alertTriggered = true;
                alertReason = "Execution time exceeded the defined SLA threshold for this instance.";
            }
        }

        await db.SaveChangesAsync();

        return Results.Ok(new { 
            success = true, 
            executionId = executionRecord.Id, 
            alertGenerated = alertTriggered,
            reason = alertReason 
        });
    }

    private static double ParseFrequencyToSeconds(string input)
{
    if (string.IsNullOrEmpty(input)) return 0;
    
    var lowerInput = input.ToLower();

    if (lowerInput.Contains("monthly") || lowerInput.Contains("mensal") || lowerInput.Contains("mês"))
    {
      
        return 12 * 3600; 
    }
    
    if (lowerInput.Contains("weekly") || lowerInput.Contains("semanal") || lowerInput.Contains("semana"))
    {
       
        return 4 * 3600;
    }

    if (lowerInput.Contains("daily") || lowerInput.Contains("diário") || lowerInput.Contains("diaria") || lowerInput.Contains("dia"))
    {
       
        return 2 * 3600;
    }

  
    var digits = new string(input.Where(char.IsDigit).ToArray());
    if (double.TryParse(digits, out double value))
    {
        if (lowerInput.Contains("min")) return value * 60;
        if (lowerInput.Contains("hour") || lowerInput.Contains("hora")) return value * 3600;
        return value; 
    }

    return 0;
}
}