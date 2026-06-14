using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using BCrypt.Net;
using FluxMonitor.Domain.Entities;

namespace FluxMonitor.Infrastructure.Data;

public class FluxMonitorDbContext : DbContext
{
    public FluxMonitorDbContext(DbContextOptions<FluxMonitorDbContext> options) : base(options) { }

    public DbSet<Users> Users { get; set; }
    public DbSet<SystemSettings> SystemSettings { get; set; }
    public DbSet<Manifest> Manifests { get; set; }
    public DbSet<Alert> Alerts { get; set; }
    public DbSet<Execution> Executions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        modelBuilder.Entity<Users>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);

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

        // --- SYSTEM SETTINGS CONFIG ---
        modelBuilder.Entity<SystemSettings>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ClientCompany).IsRequired().HasMaxLength(150);
        });

        modelBuilder.Entity<SystemSettings>().HasData(new SystemSettings
        {
            Id = 1,
            ClientCompany = "CustomCompany",
            EnableGlobalErrorActions = true,
            SendEmailOnFailure = true,
            TriggerWebhookOnFailure = false,
            CleanLogs = true,
            LogsRetentionDays = 3,
            CleanManifests = false,
            ManifestsRetentionDays = 90
        });

        
        modelBuilder.Entity<Manifest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.AssociatedFlow).IsRequired().HasMaxLength(150);
            entity.Property(e => e.FileType).IsRequired().HasMaxLength(10);
            
            var alertComparer = new ValueComparer<List<string>>(
                (c1, c2) => c1!.SequenceEqual(c2!),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList());

            entity.Property(e => e.AlertChannels)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList())
                .Metadata.SetValueComparer(alertComparer);

            var recipientsComparer = new ValueComparer<List<string>>(
                (c1, c2) => c1!.SequenceEqual(c2!),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList());

            entity.Property(e => e.Recipients)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList())
                .Metadata.SetValueComparer(recipientsComparer);
        });

        
        modelBuilder.Entity<Alert>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FlowName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.AlertType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Severity).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Description).HasMaxLength(500);

          
            var actionsComparer = new ValueComparer<List<string>>(
                (c1, c2) => c1!.SequenceEqual(c2!),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList());

            entity.Property(e => e.TriggeredAutomatedActions)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList())
                .Metadata.SetValueComparer(actionsComparer);

            
            entity.HasOne(e => e.Manifest)
                .WithMany()
                .HasForeignKey(e => e.ManifestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        
        modelBuilder.Entity<Execution>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ManifestName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.FlowName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.SystemType).HasMaxLength(50);

            
            entity.HasOne(e => e.Manifest)
                .WithMany()
                .HasForeignKey(e => e.ManifestId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}