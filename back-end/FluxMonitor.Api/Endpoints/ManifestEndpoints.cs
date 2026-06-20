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

public static class ManifestEndpoints
{
    public static void MapManifestEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/manifests");
        group.MapGet("/", GetManifests);
        group.MapDelete("/{id:guid}", DeleteManifest);
        group.MapPost("/upload", UploadManifest).DisableAntiforgery();
        // POST e PUT devem ser mapeados via INSERT/UPDATE SQL direto com parâmetros Dapper para os arrays JSON
    }

    private static async Task<IResult> GetManifests(string? status, IDbConnectionFactory dbFactory)
    {
        using var connection = dbFactory.CreateConnection();
        var manifests = await connection.QueryAsync<dynamic>(
            "sp_get_manifests", new { p_Status = status?.ToLower() }, commandType: System.Data.CommandType.StoredProcedure);

        var result = manifests.Select(m => new
        {
            Key = m.Id.ToString(),
            Name = m.Name, Flow = m.AssociatedFlow,
            ExecutionType = m.ExecutionType ?? "Recurrent",
            Frequency = m.ExpectedFrequency, MaxExecutionTime = m.MaxExecutionTime,
            LastUpdate = ((DateTime)m.UpdatedAt).ToString("yyyy-MM-dd HH:mm:ss"),
            Status = m.IsActive == 1 ? "enabled" : "disabled",
            FileType = m.FileType, FileClass = m.FileClass,
            DirIn = m.DirectoryIn, DirOut = m.DirectoryOut,
            SystemType = m.SystemType, SchedulerMachine = m.SchedulerMachine,
            AlertChannels = string.IsNullOrEmpty(m.AlertChannels) ? new System.Collections.Generic.List<string>() : JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(m.AlertChannels),
            Recipients = string.IsNullOrEmpty(m.Recipients) ? new System.Collections.Generic.List<string>() : JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(m.Recipients)
        }).ToList();

        return Results.Ok(result);
    }

    private static async Task<IResult> DeleteManifest(Guid id, IDbConnectionFactory dbFactory)
    {
        using var connection = dbFactory.CreateConnection();
        await connection.ExecuteAsync("sp_delete_manifest", new { p_Id = id.ToString() }, commandType: System.Data.CommandType.StoredProcedure);
        return Results.Ok();
    }

    private static async Task<IResult> UploadManifest(IFormFile file, IDbConnectionFactory dbFactory)
    {
        if (file == null || file.Length == 0) return Results.BadRequest("No file was uploaded.");
        
        using var stream = file.OpenReadStream();
        var dto = await JsonSerializer.DeserializeAsync<ManifestDto>(stream, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (dto == null || string.IsNullOrEmpty(dto.Name)) return Results.BadRequest("Invalid JSON content.");

        using var connection = dbFactory.CreateConnection();
        var exists = await connection.QueryFirstOrDefaultAsync<dynamic>("sp_get_manifest_by_name", new { p_Name = dto.Name }, commandType: System.Data.CommandType.StoredProcedure);
        
        if (exists != null) return Results.BadRequest($"Manifest with name '{dto.Name}' already exists.");

        string sql = @"INSERT INTO Manifests (Id, Name, AssociatedFlow, FileType, IsActive, ExecutionType, ExpectedFrequency, MaxExecutionTime, FileClass, DirectoryIn, DirectoryOut, SystemType, SchedulerMachine, AlertChannels, Recipients, UpdatedAt)
                       VALUES (@Id, @Name, @Flow, @FileType, @IsActive, @ExecutionType, @Frequency, @MaxExecutionTime, @FileClass, @DirIn, @DirOut, @SystemType, @SchedulerMachine, @AlertChannels, @Recipients, @UpdatedAt)";

        await connection.ExecuteAsync(sql, new {
            Id = Guid.NewGuid().ToString(), dto.Name, Flow = dto.Flow, FileType = dto.FileType?.ToUpper() ?? "XML",
            IsActive = dto.Status?.Equals("enabled", StringComparison.OrdinalIgnoreCase) ?? true,
            ExecutionType = dto.ExecutionType ?? "Recurrent", Frequency = dto.Frequency ?? "1 hour",
            MaxExecutionTime = dto.MaxExecutionTime ?? "15 min", dto.FileClass, DirIn = dto.DirectoryIn, DirOut = dto.DirectoryOut,
            SystemType = dto.SystemType ?? "Talend", dto.SchedulerMachine,
            AlertChannels = JsonSerializer.Serialize(dto.AlertChannels ?? new()), Recipients = JsonSerializer.Serialize(dto.Recipients ?? new()),
            UpdatedAt = DateTime.UtcNow
        });

        return Results.Ok(new { message = "Manifest imported successfully!", name = dto.Name });
    }
}