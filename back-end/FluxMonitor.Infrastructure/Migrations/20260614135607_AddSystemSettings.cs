using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace FluxMonitor.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    ClientCompany = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    EnableGlobalErrorActions = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    SendEmailOnFailure = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TriggerWebhookOnFailure = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CleanLogs = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    LogsRetentionDays = table.Column<int>(type: "int", nullable: false),
                    CleanManifests = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ManifestsRetentionDays = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.InsertData(
                table: "SystemSettings",
                columns: new[] { "Id", "CleanLogs", "CleanManifests", "ClientCompany", "EnableGlobalErrorActions", "LogsRetentionDays", "ManifestsRetentionDays", "SendEmailOnFailure", "TriggerWebhookOnFailure" },
                values: new object[] { 1, true, false, "CustomCompany", true, 3, 90, true, false });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 13, 56, 6, 778, DateTimeKind.Utc).AddTicks(5540), "$2a$11$jyqaaIWQrM/BzcDHb3uq6efgLgEEQo7uOarDAiM9o.c.PAaFcCaCu" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 12, 56, 54, 850, DateTimeKind.Utc).AddTicks(5370), "$2a$11$nN7oqkc9PtUtP5Nnu5CC5.n2j9DQ1RZeT4cjPACYrAJ/rwdgWTGui" });
        }
    }
}
