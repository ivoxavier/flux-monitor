using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FluxMonitor.Application.DTOs
{
    public record CreateUserDto(
    string Name,
    string Email,
    string Username,
    string Password,
    string Role, 
    string Holding,
    string Section,
    string Center,   
    bool IsActive   
);

public record UpdateUserDto(
    string Name,
    string Email,
    string Username,
    string Role,
    string Holding,
    string Section,
    string Center,
    bool IsActive
);
}