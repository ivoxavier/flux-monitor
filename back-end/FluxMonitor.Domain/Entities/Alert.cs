using System;
using System.Collections.Generic;

namespace FluxMonitor.Domain.Entities;

public class Alert
{
    public Guid Id { get; set; }
    
    // FK  manifest
    public Guid ManifestId { get; set; }
    public Manifest? Manifest { get; set; }

    public string FlowName { get; set; } = string.Empty;
    public string AlertType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Severity { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; 
    public string Description { get; set; } = string.Empty;
    
    public List<string> TriggeredAutomatedActions { get; set; } = new();
}