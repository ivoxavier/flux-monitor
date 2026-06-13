using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluxMonitor.Domain.Entities;

namespace FluxMonitor.Application.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(Users user);
    }
}