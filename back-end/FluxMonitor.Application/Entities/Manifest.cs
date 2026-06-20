using System;
using System.Collections.Generic;

namespace FluxMonitor.Application.Entities;

public class Manifest
{
    public Guid Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string AssociatedFlow { get; set; } = string.Empty;
    
    public string FileType { get; set; } = string.Empty; // XML, JSON, CSV
    
    public bool IsActive { get; set; }

    public string ExecutionType { get; set; } = "Recurrent";
    
    public string ExpectedFrequency { get; set; } = string.Empty; 
    
    public string MaxExecutionTime { get; set; } = string.Empty;
    
    public string? FileClass { get; set; }
    public string? DirectoryIn { get; set; }
    public string? DirectoryOut { get; set; }
    public string? SystemType { get; set; } // Talend, n8n, C#, etc.
    public string? SchedulerMachine { get; set; }
    
    public List<string> AlertChannels { get; set; } = new();
    
    public List<string> Recipients { get; set; } = new();
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}