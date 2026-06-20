using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FluxMonitor.Application.Entities
{
    public class SystemSettings
    {
        public int Id { get; set; } = 1;
        public string ClientCompany { get; set; } = string.Empty;
        public bool EnableGlobalErrorActions { get; set; }
        public bool SendEmailOnFailure { get; set; }
        public bool TriggerWebhookOnFailure { get; set; }
        public bool CleanLogs { get; set; }
        public int LogsRetentionDays { get; set; }
        public bool CleanManifests { get; set; }
        public int ManifestsRetentionDays { get; set; }
    }
}