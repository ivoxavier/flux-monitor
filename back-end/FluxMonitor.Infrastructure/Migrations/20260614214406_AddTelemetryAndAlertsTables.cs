using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FluxMonitor.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTelemetryAndAlertsTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Alerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    ManifestId = table.Column<Guid>(type: "char(36)", nullable: false),
                    FlowName = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    AlertType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Severity = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false),
                    TriggeredAutomatedActions = table.Column<string>(type: "longtext", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alerts_Manifests_ManifestId",
                        column: x => x.ManifestId,
                        principalTable: "Manifests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Executions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    ManifestId = table.Column<Guid>(type: "char(36)", nullable: false),
                    ManifestName = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    FlowName = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DurationSeconds = table.Column<double>(type: "double", nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    ErrorMessage = table.Column<string>(type: "longtext", nullable: true),
                    SystemType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    ReceivedFilesCount = table.Column<int>(type: "int", nullable: true),
                    ProcessedFilesCount = table.Column<int>(type: "int", nullable: true),
                    HttpRequestsSentCount = table.Column<int>(type: "int", nullable: true),
                    HttpRequestsReceivedCount = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Executions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Executions_Manifests_ManifestId",
                        column: x => x.ManifestId,
                        principalTable: "Manifests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 21, 44, 5, 180, DateTimeKind.Utc).AddTicks(3370), "$2a$11$5NeyS7YQ4MurvQyw0Tp/J.uGIl3NMdcQ1rVnyuLWllALnZPGtjloy" });

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_ManifestId",
                table: "Alerts",
                column: "ManifestId");

            migrationBuilder.CreateIndex(
                name: "IX_Executions_ManifestId",
                table: "Executions",
                column: "ManifestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alerts");

            migrationBuilder.DropTable(
                name: "Executions");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 16, 40, 24, 195, DateTimeKind.Utc).AddTicks(7110), "$2a$11$2L2JfnYiLIe64YVHHwYkB.XicetllwWMJGZgnGWWmZJIiIIOFM.py" });
        }
    }
}
