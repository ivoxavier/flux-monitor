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
        group.MapGet("/analytics", GetDashboardAnalyticsAsync);
        group.MapGet("/", GetExecutionsAsync);
        
    }

    private static async Task<IResult> GetExecutionsAsync(
        string? status, 
        int? limit, 
        string? date, 
        string? startDate, 
        string? endDate, 
        FluxMonitorDbContext db)
    {
        var query = db.Executions.AsQueryable();

        // Filtro de Status
        if (!string.IsNullOrEmpty(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(e => e.Status == status.ToLower());
        }

        if (!string.IsNullOrEmpty(startDate) && !string.IsNullOrEmpty(endDate))
        {
            if (DateTime.TryParse(startDate, out DateTime start) && DateTime.TryParse(endDate, out DateTime end))
            {
                query = query.Where(e => e.StartTime >= start.Date && e.StartTime <= end.Date.AddDays(1).AddTicks(-1));
            }
        }
        else if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out DateTime parsedDate))
        {
            query = query.Where(e => e.StartTime.Date == parsedDate.Date);
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

    private static async Task<IResult> GetDashboardAnalyticsAsync(string? date, FluxMonitorDbContext db)
    {
        if (!DateTime.TryParse(date, out DateTime targetDate))
        {
            targetDate = DateTime.UtcNow.Date;
        }

        var dayQuery = db.Executions.Where(e => e.StartTime.Date == targetDate.Date);

       
        int executedToday = await dayQuery.CountAsync();
        int processedFiles = await dayQuery.SumAsync(e => e.ProcessedFilesCount ?? 0);
        int httpSent = await dayQuery.SumAsync(e => e.HttpRequestsSentCount ?? 0);
        int httpReceived = await dayQuery.SumAsync(e => e.HttpRequestsReceivedCount ?? 0);
        int flowsError = await dayQuery.CountAsync(e => e.Status == "failed");
        int activeAlerts = await db.Alerts.CountAsync(a => a.Status == "active");

        var allDayExecutions = await dayQuery.Select(e => new { e.StartTime.Hour, e.Status }).ToListAsync();
        var hourlyTrend = new[] { "00:00", "04:00", "08:00", "12:00", "16:00", "20:00" }
            .Select(label => {
                int targetHour = int.Parse(label.Split(':')[0]);
                int count = allDayExecutions.Count(e => e.Hour >= targetHour && e.Hour < targetHour + 4);
                return new { Hour = label, Flows = count };
            }).ToList();

  
        var errorDistribution = allDayExecutions
            .Where(e => e.Status == "failed")
            .GroupBy(e => "Execution Error")
            .Select(g => new { Name = g.Key, Value = g.Count() })
            .ToList();

        if (!errorDistribution.Any())
        {
            errorDistribution.Add(new { Name = "No Errors", Value = 0 });
        }

        return Results.Ok(new
        {
            Widgets = new { ExecutedToday = executedToday, ProcessedFiles = processedFiles, HttpSent = httpSent, HttpReceived = httpReceived, FlowsError = flowsError, ActiveAlerts = activeAlerts },
            HourlyTrend = hourlyTrend,
            ErrorDistribution = errorDistribution
        });
    }

    private static async Task<IResult> IngestExecutionTelemetryAsync(ExecutionIngestDto dto, FluxMonitorDbContext db)
    {
        var manifest = await db.Manifests.FindAsync(dto.ManifestId);
        if (manifest == null) return Results.NotFound("Associated EDI Manifest unique ID not found.");

        Execution? executionRecord;

        
        if (dto.Status.Equals("running", StringComparison.OrdinalIgnoreCase))
        {
            executionRecord = new Execution
            {
                Id = Guid.NewGuid(),
                ManifestId = manifest.Id,
                ManifestName = dto.ManifestName,
                FlowName = manifest.AssociatedFlow,
                StartTime = DateTime.UtcNow,
                DurationSeconds = 0, 
                Status = "running",
                SystemType = manifest.SystemType ?? "Unknown",
                Holding = dto.Holding,
                Client = dto.Client,
                Department = dto.Department,
                Section = dto.Section,
                SourceSystem = dto.SourceSystem,
                TargetSystem = dto.TargetSystem
            };

            await db.Executions.AddAsync(executionRecord);
            await db.SaveChangesAsync();

            return Results.Ok(new { success = true, executionId = executionRecord.Id, status = "registered_running" });
        }

       
        if (dto.ExecutionId.HasValue)
        {
            executionRecord = await db.Executions.FindAsync(dto.ExecutionId.Value);
            if (executionRecord == null) return Results.NotFound("Initial execution record context not found.");
        }
        else
        {
            executionRecord = await db.Executions
                .Where(e => e.ManifestId == manifest.Id && e.Status == "running")
                .OrderByDescending(e => e.StartTime)
                .FirstOrDefaultAsync();
                
            if (executionRecord == null) return Results.BadRequest("No running execution context found to update.");
        }

        
        executionRecord.Status = dto.Status.ToLower();
        executionRecord.DurationSeconds = dto.ExecutionTimeSeconds ?? 0;  
        executionRecord.ErrorMessage = dto.ErrorMessage;
        executionRecord.ReceivedFilesCount = dto.ReceivedFilesCount ?? executionRecord.ReceivedFilesCount;
        executionRecord.ProcessedFilesCount = dto.ProcessedFilesCount ?? executionRecord.ProcessedFilesCount;
        executionRecord.HttpRequestsSentCount = dto.HttpRequestsSentCount ?? executionRecord.HttpRequestsSentCount;
        executionRecord.HttpRequestsReceivedCount = dto.HttpRequestsReceivedCount ?? executionRecord.HttpRequestsReceivedCount;
        
        
        executionRecord.Holding = dto.Holding ?? executionRecord.Holding;
        executionRecord.Client = dto.Client ?? executionRecord.Client;
        executionRecord.Department = dto.Department ?? executionRecord.Department;
        executionRecord.Section = dto.Section ?? executionRecord.Section;
        executionRecord.SourceSystem = dto.SourceSystem ?? executionRecord.SourceSystem;
        executionRecord.TargetSystem = dto.TargetSystem ?? executionRecord.TargetSystem;

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
                Description = dto.ErrorMessage ?? $"The job [{dto.ManifestName}] failed during execution.",
                TriggeredAutomatedActions = manifest.AlertChannels.ToList()
            };
            await db.Alerts.AddAsync(failedAlert);
            alertTriggered = true;
            alertReason = "Pipeline reported an error status at teardown.";
        }
        else if (dto.Status.Equals("success", StringComparison.OrdinalIgnoreCase))
        {
            double maxAllowedSeconds = ParseFrequencyToSeconds(manifest.MaxExecutionTime);
            if (maxAllowedSeconds > 0 && executionRecord.DurationSeconds > maxAllowedSeconds)
            {
                var slaAlert = new Alert
                {
                    Id = Guid.NewGuid(),
                    ManifestId = manifest.Id,
                    FlowName = manifest.AssociatedFlow,
                    AlertType = "SLA Exceeded",
                    Severity = "warning",
                    Status = "active",
                    Description = $"Execution took {executionRecord.DurationSeconds}s, exceeding the threshold of {manifest.MaxExecutionTime}.",
                    TriggeredAutomatedActions = manifest.AlertChannels.Contains("Web Panel") ? new List<string> { "Web Panel" } : new List<string>()
                };
                await db.Alerts.AddAsync(slaAlert);
                alertTriggered = true;
                alertReason = "SLA threshold breached.";
            }
        }

        await db.SaveChangesAsync();
        return Results.Ok(new { success = true, executionId = executionRecord.Id, alertGenerated = alertTriggered, reason = alertReason });
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