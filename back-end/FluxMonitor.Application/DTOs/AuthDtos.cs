using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FluxMonitor.Application.DTOs
{
    public record LoginRequest(string Username, string Password);
    public record LoginResponse(string Token, string Username, string UserGroup);
}