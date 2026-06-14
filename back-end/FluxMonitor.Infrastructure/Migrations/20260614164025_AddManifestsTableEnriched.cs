using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FluxMonitor.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddManifestsTableEnriched : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 16, 40, 24, 195, DateTimeKind.Utc).AddTicks(7110), "$2a$11$2L2JfnYiLIe64YVHHwYkB.XicetllwWMJGZgnGWWmZJIiIIOFM.py" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 6, 14, 16, 24, 50, 720, DateTimeKind.Utc).AddTicks(8110), "$2a$11$YH.cvlziwSMsg6nYPRm5uuaJBWHpLSmezwIfnvHXMQWxROrChSLAC" });
        }
    }
}
