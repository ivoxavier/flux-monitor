using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FluxMonitor.Application.DTOs;

public class ManifestDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public string Flow { get; set; } = string.Empty;
    
    [Required]
    public string FileType { get; set; } = string.Empty;
    
    [Required]
    public string Status { get; set; } = string.Empty;

    
    [Required]
    public string ExecutionType { get; set; } = "Recurrent";

    [Required]
    public string Frequency { get; set; } = string.Empty; 

    [Required]
    public string MaxExecutionTime { get; set; } = string.Empty;

    public string? FileClass { get; set; }
    public string? DirectoryIn { get; set; }
    public string? DirectoryOut { get; set; }
    public string? SystemType { get; set; }
    public string? SchedulerMachine { get; set; }
    public List<string> AlertChannels { get; set; } = new();
    public List<string> Recipients { get; set; } = new();
}