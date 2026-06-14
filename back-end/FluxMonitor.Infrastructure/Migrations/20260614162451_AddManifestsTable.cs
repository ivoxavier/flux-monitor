using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FluxMonitor.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddManifestsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Manifests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    AssociatedFlow = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    FileType = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ExpectedFrequency = table.Column<string>(type: "longtext", nullable: false),
                    MaxExecutionTime = table.Column<string>(type: "longtext", nullable: false),
                    FileClass = table.Column<string>(type: "longtext", nullable: true),
                    DirectoryIn = table.Column<string>(type: "longtext", nullable: true),
                    DirectoryOut = table.Column<string>(type: "longtext", nullable: true),
                    SystemType = table.Column<string>(type: "longtext", nullable: true),
                    SchedulerMachine = table.Column<string>(type: "longtext", nullable: true),
                    AlertChannels = table.Column<string>(type: "longtext", nullable: false),
                    Recipients = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Manifests", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 16, 24, 50, 720, DateTimeKind.Utc).AddTicks(8110), "$2a$11$YH.cvlziwSMsg6nYPRm5uuaJBWHpLSmezwIfnvHXMQWxROrChSLAC" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Manifests");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 13, 56, 6, 778, DateTimeKind.Utc).AddTicks(5540), "$2a$11$jyqaaIWQrM/BzcDHb3uq6efgLgEEQo7uOarDAiM9o.c.PAaFcCaCu" });
        }
    }
}
