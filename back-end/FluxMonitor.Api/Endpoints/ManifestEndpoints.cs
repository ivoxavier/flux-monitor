using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using FluxMonitor.Application.DTOs;
using FluxMonitor.Domain.Entities;
using FluxMonitor.Infrastructure.Data;

namespace FluxMonitor.Api.Endpoints;

public static class ManifestEndpoints
{
    public static void MapManifestEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/manifests");

        group.MapGet("/", GetManifestsAsync);
        group.MapPost("/", CreateManifestAsync);
        group.MapPut("/{id:guid}", UpdateManifestAsync);
        group.MapDelete("/{id:guid}", DeleteManifestAsync);
        group.MapPost("/upload", UploadManifestAsync).DisableAntiforgery();
        group.MapGet("/{id:guid}/detail", GetFlowDetailAsync);
        group.MapGet("/{id:guid}/execution-history", GetFlowExecutionHistoryAsync);
    }

    private static async Task<IResult> GetManifestsAsync(string? name, string? status, FluxMonitorDbContext db)
    {
        var query = db.Manifests.AsQueryable();

        if (!string.IsNullOrEmpty(name))
        {
            query = query.Where(m => m.Name.Contains(name));
        }

        if (!string.IsNullOrEmpty(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            bool isActiveFilter = status.Equals("enabled", StringComparison.OrdinalIgnoreCase);
            query = query.Where(m => m.IsActive == isActiveFilter);
        }

        var manifests = await query
            .OrderByDescending(m => m.UpdatedAt)
            .Select(m => new
            {
                Key = m.Id.ToString(),
                Name = m.Name,
                Flow = m.AssociatedFlow,
                ExecutionType = m.ExecutionType ?? "Recurrent", // 🟢 Projected to match the front-end dual-concept
                Frequency = m.ExpectedFrequency,
                MaxExecutionTime = m.MaxExecutionTime,
                LastUpdate = m.UpdatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                Status = m.IsActive ? "enabled" : "disabled",
                FileType = m.FileType,
                FileClass = m.FileClass,
                DirIn = m.DirectoryIn,
                DirOut = m.DirectoryOut,
                SystemType = m.SystemType,
                SchedulerMachine = m.SchedulerMachine,
                AlertChannels = m.AlertChannels, 
                Recipients = m.Recipients
            })
            .ToListAsync();

        return Results.Ok(manifests);
    }

    private static async Task<IResult> CreateManifestAsync(ManifestDto dto, FluxMonitorDbContext db)
    {
        var newManifest = new Manifest
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            AssociatedFlow = dto.Flow,
            FileType = dto.FileType.ToUpper(),
            IsActive = dto.Status.Equals("enabled", StringComparison.OrdinalIgnoreCase),
            ExecutionType = dto.ExecutionType, // 🟢 Persisting the decoupled model property
            ExpectedFrequency = dto.Frequency,
            MaxExecutionTime = dto.MaxExecutionTime,
            AlertChannels = dto.AlertChannels,
            Recipients = dto.Recipients,
            FileClass = dto.FileClass,
            DirectoryIn = dto.DirectoryIn,
            DirectoryOut = dto.DirectoryOut,
            SystemType = dto.SystemType,
            SchedulerMachine = dto.SchedulerMachine,
            UpdatedAt = DateTime.UtcNow
        };

        await db.Manifests.AddAsync(newManifest);
        await db.SaveChangesAsync();

        return Results.StatusCode(StatusCodes.Status201Created);
    }

    private static async Task<IResult> UpdateManifestAsync(Guid id, ManifestDto dto, FluxMonitorDbContext db)
    {
        var manifest = await db.Manifests.FindAsync(id);
        if (manifest == null) return Results.NotFound("Manifest not found.");

        manifest.Name = dto.Name;
        manifest.AssociatedFlow = dto.Flow;
        manifest.FileType = dto.FileType.ToUpper();
        manifest.IsActive = dto.Status.Equals("enabled", StringComparison.OrdinalIgnoreCase);
        manifest.ExecutionType = dto.ExecutionType; // 🟢 Updates the decoupled execution category
        manifest.ExpectedFrequency = dto.Frequency;
        manifest.MaxExecutionTime = dto.MaxExecutionTime;
        manifest.AlertChannels = dto.AlertChannels;
        manifest.Recipients = dto.Recipients;
        manifest.FileClass = dto.FileClass;
        manifest.DirectoryIn = dto.DirectoryIn;
        manifest.DirectoryOut = dto.DirectoryOut;
        manifest.SystemType = dto.SystemType;
        manifest.SchedulerMachine = dto.SchedulerMachine;
        manifest.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Results.Ok();
    }

    private static async Task<IResult> DeleteManifestAsync(Guid id, FluxMonitorDbContext db)
    {
        var manifest = await db.Manifests.FindAsync(id);
        if (manifest == null) return Results.NotFound("Manifest not found.");

        db.Manifests.Remove(manifest);
        await db.SaveChangesAsync();
        return Results.Ok();
    }

    private static async Task<IResult> UploadManifestAsync(IFormFile file, FluxMonitorDbContext db)
    {
        if (file == null || file.Length == 0) 
            return Results.BadRequest("No file was uploaded or the uploaded file is empty.");

        var extension = Path.GetExtension(file.FileName).ToLower(); 
        if (extension != ".json")
        {
            return Results.BadRequest("Only files with the .json extension are allowed.");
        }

        try
        {
            using var stream = file.OpenReadStream();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var dto = await JsonSerializer.DeserializeAsync<ManifestDto>(stream, options);

            if (dto == null || string.IsNullOrEmpty(dto.Name) || string.IsNullOrEmpty(dto.Flow))
            {
                return Results.BadRequest("JSON content is invalid or fields are missing (Name, Flow).");
            }

            if (await db.Manifests.AnyAsync(m => m.Name.ToLower() == dto.Name.ToLower()))
            {
                return Results.BadRequest($"There's already a Manifest with the name '{dto.Name}'.");
            }

            var newManifest = new Manifest
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                AssociatedFlow = dto.Flow,
                FileType = dto.FileType?.ToUpper() ?? "XML",
                IsActive = dto.Status?.Equals("enabled", StringComparison.OrdinalIgnoreCase) ?? true,
                ExecutionType = dto.ExecutionType ?? "Recurrent", // 🟢 Fallback for legacy JSON layout structures
                ExpectedFrequency = dto.Frequency ?? "1 hour",
                MaxExecutionTime = dto.MaxExecutionTime ?? "15 min",
                FileClass = dto.FileClass,
                DirectoryIn = dto.DirectoryIn,
                DirectoryOut = dto.DirectoryOut,
                SystemType = dto.SystemType ?? "Talend",
                SchedulerMachine = dto.SchedulerMachine,
                AlertChannels = dto.AlertChannels ?? new List<string>(),
                Recipients = dto.Recipients ?? new List<string>(),
                UpdatedAt = DateTime.UtcNow
            };

            await db.Manifests.AddAsync(newManifest);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "Manifest parsed and imported successfully", name = newManifest.Name });
        }
        catch (JsonException)
        {
            return Results.BadRequest("Critical syntax error in the JSON file. Please check the formatting.");
        }
        catch (Exception ex)
        {
            return Results.Problem($"An internal error occurred while processing the manifest: {ex.Message}");
        }
    }

    private static async Task<IResult> GetFlowDetailAsync(Guid id, FluxMonitorDbContext db)
{
    var manifest = await db.Manifests.FindAsync(id);
    if (manifest == null) return Results.NotFound("Manifest/Flow not found.");

    // Calcular métricas agregadas com base nas execuções reais
    var executionsQuery = db.Executions.Where(e => e.ManifestId == id);
    
    int totalExecutionsToday = await executionsQuery
        .Where(e => e.StartTime >= DateTime.UtcNow.Date)
        .CountAsync();

    double avgDuration = await executionsQuery
        .Where(e => e.Status == "success")
        .Select(e => e.DurationSeconds)
        .DefaultIfEmpty(0)
        .AverageAsync();

    int totalSuccess = await executionsQuery.CountAsync(e => e.Status == "success");
    int totalCount = await executionsQuery.CountAsync();
    double successRate = totalCount > 0 ? ((double)totalSuccess / totalCount) * 100 : 100;

    var lastExecution = await executionsQuery
        .OrderByDescending(e => e.StartTime)
        .FirstOrDefaultAsync();

    return Results.Ok(new
    {
      Name = manifest.Name,
      Source = manifest.SystemType ?? "N/A",
      Destination = "Target System", // Podes mapear para uma coluna real se a tiveres
      EdiType = manifest.FileType,
      Frequency = manifest.ExpectedFrequency,
      SlaDefined = manifest.MaxExecutionTime,
      AvgDuration = $"{Math.Round(avgDuration, 2)}s",
      SuccessRate = Math.Round(successRate, 1),
      TotalExecutionsToday = totalExecutionsToday,
      Status = manifest.IsActive ? "operational" : "disabled",
      LastExecutionTime = lastExecution?.StartTime.ToString("yyyy-MM-dd HH:mm:ss") ?? "N/A",
      NextExecutionTime = DateTime.UtcNow.AddMinutes(15).ToString("yyyy-MM-dd HH:mm:ss") // Simulação de Scheduler
    });
}

private static async Task<IResult> GetFlowExecutionHistoryAsync(Guid id, FluxMonitorDbContext db)
{
    var history = await db.Executions
        .Where(e => e.ManifestId == id)
        .OrderByDescending(e => e.StartTime)
        .Take(30)
        .Select(e => new
        {
            Key = e.Id.ToString(),
            Timestamp = e.StartTime.ToString("yyyy-MM-dd HH:mm:ss"),
            Status = e.Status, 
            Duration = $"{Math.Round(e.DurationSeconds, 2)}s",
            DurationRaw = e.DurationSeconds, 
            ProcessedFiles = e.ProcessedFilesCount ?? 0,
            ErrorLog = e.ErrorMessage ?? "No errors reported."
        })
        .ToListAsync();

    return Results.Ok(history);
}
}