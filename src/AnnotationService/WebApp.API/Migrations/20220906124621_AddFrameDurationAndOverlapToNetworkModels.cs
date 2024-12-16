using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApp.API.Migrations
{
    public partial class AddFrameDurationAndOverlapToNetworkModels : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FrameDuration",
                table: "NetworkModels",
                type: "int",
                nullable: false,
                defaultValue: 2);

            migrationBuilder.AddColumn<int>(
                name: "FrameOverlap",
                table: "NetworkModels",
                type: "int",
                nullable: false,
                defaultValue: 1);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FrameDuration",
                table: "NetworkModels");

            migrationBuilder.DropColumn(
                name: "FrameOverlap",
                table: "NetworkModels");
        }
    }
}
