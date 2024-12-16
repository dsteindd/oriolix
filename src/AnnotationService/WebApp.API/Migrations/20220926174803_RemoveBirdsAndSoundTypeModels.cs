using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApp.API.Migrations
{
    public partial class RemoveBirdsAndSoundTypeModels : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Annotation_BirdSpecies_SpeciesId",
                table: "Annotation");

            migrationBuilder.DropForeignKey(
                name: "FK_Annotation_SoundTypes_SoundTypeId",
                table: "Annotation");

            migrationBuilder.DropTable(
                name: "BirdSpecies");

            migrationBuilder.DropTable(
                name: "SoundTypes");

            migrationBuilder.DropTable(
                name: "BirdFamilies");

            migrationBuilder.DropIndex(
                name: "IX_Annotation_SoundTypeId",
                table: "Annotation");

            migrationBuilder.DropIndex(
                name: "IX_Annotation_SpeciesId",
                table: "Annotation");

            migrationBuilder.DropColumn(
                name: "SoundTypeId",
                table: "Annotation");

            migrationBuilder.DropColumn(
                name: "SpeciesId",
                table: "Annotation");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SoundTypeId",
                table: "Annotation",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "SpeciesId",
                table: "Annotation",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateTable(
                name: "BirdFamilies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FamilyName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BirdFamilies", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "SoundTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoundTypes", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "BirdSpecies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FamilyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CommonName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EuringNumber = table.Column<int>(type: "int", nullable: true),
                    SpeciesName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BirdSpecies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BirdSpecies_BirdFamilies_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "BirdFamilies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Annotation_SoundTypeId",
                table: "Annotation",
                column: "SoundTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Annotation_SpeciesId",
                table: "Annotation",
                column: "SpeciesId");

            migrationBuilder.CreateIndex(
                name: "IX_BirdSpecies_FamilyId",
                table: "BirdSpecies",
                column: "FamilyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Annotation_BirdSpecies_SpeciesId",
                table: "Annotation",
                column: "SpeciesId",
                principalTable: "BirdSpecies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Annotation_SoundTypes_SoundTypeId",
                table: "Annotation",
                column: "SoundTypeId",
                principalTable: "SoundTypes",
                principalColumn: "Id");
        }
    }
}
