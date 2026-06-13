using Microsoft.EntityFrameworkCore;
using FluxMonitor.Domain;

namespace FluxMonitor.Infrastructure.Data;

public class FluxMonitorDbContext : DbContext
{
    public FluxMonitorDbContext(DbContextOptions<FluxMonitorDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Temporary Admin Test User
        // pass "admin123"
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = Guid.Parse("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
            Username = "admin",
            Email = "admin@fluxmonitor.com",
            // Hash gerado previamente para a string "admin123" usando BCrypt
            PasswordHash = "$2a$11$mC/7D3bV7KzS6gM7rMhRre7VbLmWXv8A1O5JmWqE2qE5i6z3c2q1G", 
            UserGroup = "admin"
        });
    }
}