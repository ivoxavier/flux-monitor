using System;
using System.ComponentModel.DataAnnotations;

namespace FluxMonitor.Application.DTOs;

public class ExecutionIngestDto
{

    public Guid? ExecutionId { get; set; }

    [Required(ErrorMessage = "ManifestId is required.")]
    public Guid ManifestId { get; set; }

    [Required(ErrorMessage = "ManifestName is required.")]
    [StringLength(150, ErrorMessage = "ManifestName cannot exceed 150 characters.")]
    public string ManifestName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Status is required.")]
    [RegularExpression("^(running|success|failed)$", ErrorMessage = "Status must be 'running', 'success' or 'failed'.")]
    public string Status { get; set; } = string.Empty;

    public double? ExecutionTimeSeconds { get; set; }
    
    [StringLength(500, ErrorMessage = "ErrorMessage cannot exceed 500 characters.")]
    public string? ErrorMessage { get; set; }

    public int? ReceivedFilesCount { get; set; }
    public int? ProcessedFilesCount { get; set; }
    public int? HttpRequestsSentCount { get; set; }
    public int? HttpRequestsReceivedCount { get; set; }

    public string? Holding { get; set; }
    public string? Client { get; set; }
    public string? Department { get; set; }
    public string? Section { get; set; }
    public string? SourceSystem { get; set; }
    public string? TargetSystem { get; set; }
}