using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FluxMonitor.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationalMetadataToExecutions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Client",
                table: "Executions",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "Executions",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Holding",
                table: "Executions",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "Executions",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceSystem",
                table: "Executions",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TargetSystem",
                table: "Executions",
                type: "longtext",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 22, 7, 46, 689, DateTimeKind.Utc).AddTicks(4750), "$2a$11$0G3y6B3MLQdUdhfNSJV3l.Y4MMeIrEboYrerAmIT.CVz0x3tqpE/C" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Client",
                table: "Executions");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "Executions");

            migrationBuilder.DropColumn(
                name: "Holding",
                table: "Executions");

            migrationBuilder.DropColumn(
                name: "Section",
                table: "Executions");

            migrationBuilder.DropColumn(
                name: "SourceSystem",
                table: "Executions");

            migrationBuilder.DropColumn(
                name: "TargetSystem",
                table: "Executions");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 21, 44, 5, 180, DateTimeKind.Utc).AddTicks(3370), "$2a$11$5NeyS7YQ4MurvQyw0Tp/J.uGIl3NMdcQ1rVnyuLWllALnZPGtjloy" });
        }
    }
}
