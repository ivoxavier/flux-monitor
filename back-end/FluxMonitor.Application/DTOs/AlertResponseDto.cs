using System;
using System.Collections.Generic;

namespace FluxMonitor.Application.DTOs;

public class AlertResponseDto
{
    public string Key { get; set; } = string.Empty; 
    public string FlowName { get; set; } = string.Empty; 
    public string AlertType { get; set; } = string.Empty; 
    public string Timestamp { get; set; } = string.Empty; 
    public string Severity { get; set; } = string.Empty; 
    public string Status { get; set; } = string.Empty; 
    public string Description { get; set; } = string.Empty; 
    public List<string> TriggeredAutomatedActions { get; set; } = new();
}