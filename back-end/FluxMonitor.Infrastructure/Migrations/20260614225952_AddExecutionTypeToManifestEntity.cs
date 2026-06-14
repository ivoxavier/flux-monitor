using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FluxMonitor.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExecutionTypeToManifestEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExecutionType",
                table: "Manifests",
                type: "longtext",
                nullable: false);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 22, 59, 50, 535, DateTimeKind.Utc).AddTicks(9880), "$2a$11$2GrUmRa9XBohk2cWqwyaYOt3G2EoIWCoIZLS.ZPFtoXSd0JK2m9rO" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExecutionType",
                table: "Manifests");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 22, 7, 46, 689, DateTimeKind.Utc).AddTicks(4750), "$2a$11$0G3y6B3MLQdUdhfNSJV3l.Y4MMeIrEboYrerAmIT.CVz0x3tqpE/C" });
        }
    }
}
