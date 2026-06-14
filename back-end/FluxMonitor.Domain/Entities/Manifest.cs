using System;
using System.Collections.Generic;

namespace FluxMonitor.Domain.Entities;

public class Manifest
{
    public Guid Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string AssociatedFlow { get; set; } = string.Empty;
    
    public string FileType { get; set; } = string.Empty;
    
    public bool IsActive { get; set; }
    
    public string ExpectedFrequency { get; set; } = string.Empty;
    
    public string MaxExecutionTime { get; set; } = string.Empty;
    
    
    public string? FileClass { get; set; }
    public string? DirectoryIn { get; set; }
    public string? DirectoryOut { get; set; }
    public string? SystemType { get; set; }
    public string? SchedulerMachine { get; set; }
    
    
    public List<string> AlertChannels { get; set; } = new();
    
    public List<string> Recipients { get; set; } = new();
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}