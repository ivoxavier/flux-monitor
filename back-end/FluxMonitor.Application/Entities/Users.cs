using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FluxMonitor.Application.Entities
{
    public class Users
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string UserGroup { get; set; } = "monitor"; // admin, monitor, edi-developer
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}