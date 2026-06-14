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
using System.Text.Json;

namespace FluxMonitor.Api.Endpoints
{
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
            return Results.BadRequest($"There's already an Manifest with that name '{dto.Name}'.");
        }


            var newManifest = new Manifest
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                AssociatedFlow = dto.Flow,
                FileType = dto.FileType?.ToUpper() ?? "XML",
                IsActive = dto.Status?.Equals("enabled", StringComparison.OrdinalIgnoreCase) ?? true,
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
    }
}