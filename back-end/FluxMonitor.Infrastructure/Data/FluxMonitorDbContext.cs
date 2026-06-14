using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using FluxMonitor.Domain.Entities;


namespace FluxMonitor.Infrastructure.Data;

public class FluxMonitorDbContext : DbContext
{
    public FluxMonitorDbContext(DbContextOptions<FluxMonitorDbContext> options) : base(options) { }

    public DbSet<Users> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    
    modelBuilder.Entity<Users>(entity =>
    {
        entity.HasKey(e => e.Id);
        
        entity.Property(e => e.Username)
            .IsRequired()
            .HasMaxLength(50);
            
        entity.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(150);

        
        entity.HasIndex(e => e.Username).IsUnique();
        entity.HasIndex(e => e.Email).IsUnique();
    });

    // Temporary Admin Test User (pass: admin123)
    modelBuilder.Entity<Users>().HasData(new Users
    {
        Id = Guid.Parse("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
        Username = "admin",
        Email = "admin@fluxmonitor.com",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), 
        UserGroup = "admin",
        IsActive = true,
        CreatedAt = DateTime.UtcNow 
    });
}
}