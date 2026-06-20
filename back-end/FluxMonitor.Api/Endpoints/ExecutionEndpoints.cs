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

public static class ExecutionEndpoints
{
    public static void MapExecutionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/executions");
        group.MapPost("/ingest", IngestExecutionTelemetry);
        group.MapGet("/analytics", GetDashboardAnalytics);
        group.MapGet("/", GetExecutions);
    }

    private static async Task<IResult> GetExecutions(string? status, int? limit, string? date, string? startDate, string? endDate, IDbConnectionFactory dbFactory)
    {
        using var connection = dbFactory.CreateConnection();

        DateTime? start = null, end = null;
        if (!string.IsNullOrEmpty(startDate) && !string.IsNullOrEmpty(endDate))
        {
            if (DateTime.TryParse(startDate, out var s) && DateTime.TryParse(endDate, out var e)) { start = s; end = e.AddDays(1).AddTicks(-1); }
        }
        else if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var d))
        {
            start = d.Date; end = d.Date.AddDays(1).AddTicks(-1);
        }

        var executions = await connection.QueryAsync<dynamic>(
            "sp_get_executions",
            new { p_Status = status?.ToLower(), p_StartDate = start, p_EndDate = end, p_Limit = limit ?? 50 },
            commandType: System.Data.CommandType.StoredProcedure);

        var result = executions.Select(e => new
        {
            Key = e.Id.ToString(),
            ManifestName = e.ManifestName, FlowName = e.FlowName,
            Timestamp = ((DateTime)e.StartTime).ToString("yyyy-MM-dd HH:mm:ss"),
            Duration = e.DurationSeconds, Status = e.Status, Error = e.ErrorMessage,
            System = e.SystemType, ReceivedFiles = e.ReceivedFilesCount ?? 0,
            ProcessedFiles = e.ProcessedFilesCount ?? 0, HttpSent = e.HttpRequestsSentCount ?? 0,
            HttpReceived = e.HttpRequestsReceivedCount ?? 0,
            Holding = e.Holding ?? "N/A", Client = e.Client ?? "N/A",
            Department = e.Department ?? "N/A", Section = e.Section ?? "N/A",
            SourceSystem = e.SourceSystem ?? "N/A", TargetSystem = e.TargetSystem ?? "N/A"
        }).ToList();

        return Results.Ok(result);
    }

    private static async Task<IResult> GetDashboardAnalytics(string? date, IDbConnectionFactory dbFactory)
    {
        using var connection = dbFactory.CreateConnection();
        var targetDate = DateTime.TryParse(date, out var d) ? d.Date : DateTime.UtcNow.Date;

        // Executa SP com múltiplos result sets
        using var multi = await connection.QueryMultipleAsync("sp_get_dashboard_analytics", new { p_TargetDate = targetDate }, commandType: System.Data.CommandType.StoredProcedure);

        var widgets = await multi.ReadFirstOrDefaultAsync<dynamic>();
        var hourlyRaw = await multi.ReadAsync<dynamic>();

        var hourlyTrend = new[] { "00:00", "04:00", "08:00", "12:00", "16:00", "20:00" }
            .Select(label => {
                int th = int.Parse(label.Split(':')[0]);
                int count = hourlyRaw.Count(e => (int)e.HourOfDay >= th && (int)e.HourOfDay < th + 4);
                return new { Hour = label, Flows = count };
            }).ToList();

        var errorDistribution = hourlyRaw.Where(e => e.Status == "failed")
            .GroupBy(e => "Execution Error")
            .Select(g => new { Name = g.Key, Value = g.Count() }).ToList();

        if (!errorDistribution.Any()) errorDistribution.Add(new { Name = "No Errors", Value = 0 });

        return Results.Ok(new { Widgets = widgets, HourlyTrend = hourlyTrend, ErrorDistribution = errorDistribution });
    }

    // O Ingest é mais limpo gerido via SQL direto parametrizado pelo C# para preservar o Controlo de Negócio
    private static async Task<IResult> IngestExecutionTelemetry(ExecutionIngestDto dto, IDbConnectionFactory dbFactory)
    {
        using var connection = dbFactory.CreateConnection();
        var manifest = await connection.QueryFirstOrDefaultAsync<dynamic>("sp_get_manifest_by_id", new { p_Id = dto.ManifestId.ToString() }, commandType: System.Data.CommandType.StoredProcedure);
        
        if (manifest == null) return Results.NotFound("Manifest not found.");

        if (dto.Status.Equals("running", StringComparison.OrdinalIgnoreCase))
        {
            var newId = Guid.NewGuid().ToString();
            string sqlInsert = @"INSERT INTO Executions (Id, ManifestId, ManifestName, FlowName, StartTime, DurationSeconds, Status, SystemType, Holding, Client, Department, Section, SourceSystem, TargetSystem) 
                                 VALUES (@Id, @ManifestId, @ManifestName, @FlowName, @StartTime, 0, 'running', @SystemType, @Holding, @Client, @Department, @Section, @SourceSystem, @TargetSystem)";
            
            await connection.ExecuteAsync(sqlInsert, new {
                Id = newId, ManifestId = dto.ManifestId.ToString(), dto.ManifestName, FlowName = manifest.AssociatedFlow,
                StartTime = DateTime.UtcNow, SystemType = manifest.SystemType ?? "Unknown",
                dto.Holding, dto.Client, dto.Department, dto.Section, dto.SourceSystem, dto.TargetSystem
            });
            return Results.Ok(new { success = true, executionId = newId, status = "registered_running" });
        }

        // Cenário Fecho (Update)
        string execId = dto.ExecutionId?.ToString() ?? string.Empty;
        if (string.IsNullOrEmpty(execId))
        {
            var runningExec = await connection.QueryFirstOrDefaultAsync<dynamic>("sp_get_running_execution", new { p_ManifestId = dto.ManifestId.ToString() }, commandType: System.Data.CommandType.StoredProcedure);
            if (runningExec == null) return Results.BadRequest("No running execution context found.");
            execId = runningExec.Id;
        }

        string sqlUpdate = @"UPDATE Executions SET Status = @Status, DurationSeconds = @DurationSeconds, ErrorMessage = @ErrorMessage, 
                             ReceivedFilesCount = COALESCE(@ReceivedFilesCount, ReceivedFilesCount), ProcessedFilesCount = COALESCE(@ProcessedFilesCount, ProcessedFilesCount),
                             HttpRequestsSentCount = COALESCE(@HttpRequestsSentCount, HttpRequestsSentCount), HttpRequestsReceivedCount = COALESCE(@HttpRequestsReceivedCount, HttpRequestsReceivedCount)
                             WHERE Id = @Id";
        
        await connection.ExecuteAsync(sqlUpdate, new {
            Id = execId, Status = dto.Status.ToLower(), DurationSeconds = dto.ExecutionTimeSeconds ?? 0, dto.ErrorMessage,
            dto.ReceivedFilesCount, dto.ProcessedFilesCount, dto.HttpRequestsSentCount, dto.HttpRequestsReceivedCount
        });

        // Alertas Logic ... (Mesma lógica do C# que já tinhas, chamando a 'sp_InsertAlert' caso o SLA rebente ou falhe).
        if (dto.Status.Equals("failed", StringComparison.OrdinalIgnoreCase))
        {
            await connection.ExecuteAsync("sp_insert_alert", new {
                p_Id = Guid.NewGuid().ToString(), p_ManifestId = dto.ManifestId.ToString(), p_FlowName = manifest.AssociatedFlow,
                p_AlertType = "Execution Failure", p_Severity = "critical", p_Status = "active",
                p_Description = dto.ErrorMessage ?? "Job failed.", p_TriggeredAutomatedActions = manifest.AlertChannels // Array JSON
            }, commandType: System.Data.CommandType.StoredProcedure);
        }

        return Results.Ok(new { success = true, executionId = execId });
    }
}