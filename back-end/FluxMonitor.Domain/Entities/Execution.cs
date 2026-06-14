using System;

namespace FluxMonitor.Domain.Entities;

public class Execution
{
    public Guid Id { get; set; }
    
    public Guid ManifestId { get; set; }
    public Manifest? Manifest { get; set; }

    public string ManifestName { get; set; } = string.Empty;
    public string FlowName { get; set; } = string.Empty;
    
    public DateTime StartTime { get; set; } = DateTime.UtcNow;
    public double DurationSeconds { get; set; }
    
    public string Status { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public string SystemType { get; set; } = string.Empty; 

    
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