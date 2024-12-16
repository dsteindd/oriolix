using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApp.API.Migrations
{
    public partial class RemoveNotRequiredFieldsForNetwork : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InputImageHeight",
                table: "NetworkModels");

            migrationBuilder.DropColumn(
                name: "IsGrayscale",
                table: "NetworkModels");

            migrationBuilder.RenameColumn(
                name: "InputImageWidth",
                table: "NetworkModels",
                newName: "Format");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Format",
                table: "NetworkModels",
                newName: "InputImageWidth");

            migrationBuilder.AddColumn<int>(
                name: "InputImageHeight",
                table: "NetworkModels",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "IsGrayscale",
                table: "NetworkModels",
                type: "varchar(1)",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
