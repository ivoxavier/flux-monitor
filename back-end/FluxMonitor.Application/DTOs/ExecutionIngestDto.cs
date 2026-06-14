using System;
using System.ComponentModel.DataAnnotations;

namespace FluxMonitor.Application.DTOs;

public class ExecutionIngestDto
{
    [Required(ErrorMessage = "ManifestId is required.")]
    public Guid ManifestId { get; set; }

    [Required(ErrorMessage = "ManifestName is required.")]
    [StringLength(150, ErrorMessage = "ManifestName cannot exceed 150 characters.")]
    public string ManifestName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Status is required.")]
    [RegularExpression("^(success|failed)$", ErrorMessage = "Status must be either 'success' or 'failed'.")]
    public string Status { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "ErrorMessage cannot exceed 500 characters.")]
    public string? ErrorMessage { get; set; }

    [Required(ErrorMessage = "ExecutionTimeSeconds is required.")]
    [Range(0, double.MaxValue, ErrorMessage = "Execution time must be a positive number.")]
    public double ExecutionTimeSeconds { get; set; }

    
    [Range(0, int.MaxValue, ErrorMessage = "ReceivedFilesCount must be a positive integer.")]
    public int? ReceivedFilesCount { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "ProcessedFilesCount must be a positive integer.")]
    public int? ProcessedFilesCount { get; set; }

    
    [Range(0, int.MaxValue, ErrorMessage = "HttpRequestsSentCount must be a positive integer.")]
    public int? HttpRequestsSentCount { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "HttpRequestsReceivedCount must be a positive integer.")]
    public int? HttpRequestsReceivedCount { get; set; }

    [StringLength(100)]
    public string? Holding { get; set; }

    [StringLength(150)]
    public string? Client { get; set; }

    [StringLength(100)]
    public string? Department { get; set; }

    [StringLength(100)]
    public string? Section { get; set; }

    [StringLength(100)]
    public string? SourceSystem { get; set; }

    [StringLength(100)]
    public string? TargetSystem { get; set; }
}