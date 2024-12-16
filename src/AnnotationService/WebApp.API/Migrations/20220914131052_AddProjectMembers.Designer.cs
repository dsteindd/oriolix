﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WebApp.API.Data;

#nullable disable

namespace WebApp.API.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20220914131052_AddProjectMembers")]
    partial class AddProjectMembers
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.6")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("IdentityServer4.EntityFramework.Entities.DeviceFlowCodes", b =>
                {
                    b.Property<string>("UserCode")
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<DateTime>("CreationTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Data")
                        .IsRequired()
                        .HasMaxLength(50000)
                        .HasColumnType("longtext");

                    b.Property<string>("Description")
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<string>("DeviceCode")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<DateTime?>("Expiration")
                        .IsRequired()
                        .HasColumnType("datetime(6)");

                    b.Property<string>("SessionId")
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<string>("SubjectId")
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.HasKey("UserCode");

                    b.HasIndex("DeviceCode")
                        .IsUnique();

                    b.HasIndex("Expiration");

                    b.ToTable("DeviceCodes", (string)null);
                });

            modelBuilder.Entity("IdentityServer4.EntityFramework.Entities.PersistedGrant", b =>
                {
                    b.Property<string>("Key")
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<DateTime?>("ConsumedTime")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("CreationTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Data")
                        .IsRequired()
                        .HasMaxLength(50000)
                        .HasColumnType("longtext");

                    b.Property<string>("Description")
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<DateTime?>("Expiration")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("SessionId")
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<string>("SubjectId")
                        .HasMaxLength(200)
                        .HasColumnType("varchar(200)");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.HasKey("Key");

                    b.HasIndex("Expiration");

                    b.HasIndex("SubjectId", "ClientId", "Type");

                    b.HasIndex("SubjectId", "SessionId", "Type");

                    b.ToTable("PersistedGrants", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<System.Guid>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("ClaimType")
                        .HasColumnType("longtext");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("longtext");

                    b.Property<Guid>("RoleId")
                        .HasColumnType("char(36)");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("RoleClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<System.Guid>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("ClaimType")
                        .HasColumnType("longtext");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("longtext");

                    b.Property<Guid>("UserId")
                        .HasColumnType("char(36)");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("UserClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<System.Guid>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("longtext");

                    b.Property<Guid>("UserId")
                        .HasColumnType("char(36)");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("UserLogins", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<System.Guid>", b =>
                {
                    b.Property<Guid>("UserId")
                        .HasColumnType("char(36)");

                    b.Property<Guid>("RoleId")
                        .HasColumnType("char(36)");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("UserRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<System.Guid>", b =>
                {
                    b.Property<Guid>("UserId")
                        .HasColumnType("char(36)");

                    b.Property<string>("LoginProvider")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Name")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Value")
                        .HasColumnType("longtext");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("UserTokens", (string)null);
                });

            modelBuilder.Entity("WebApp.API.Models.ApplicationRole", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("longtext");

                    b.Property<string>("Name")
                        .HasMaxLength(256)
                        .HasColumnType("varchar(256)");

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256)
                        .HasColumnType("varchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasDatabaseName("RoleNameIndex");

                    b.ToTable("Roles", (string)null);
                });

            modelBuilder.Entity("WebApp.API.Models.ApplicationUser", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("int");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("longtext");

                    b.Property<string>("Email")
                        .HasMaxLength(256)
                        .HasColumnType("varchar(256)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("tinyint(1)");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256)
                        .HasColumnType("varchar(256)");

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256)
                        .HasColumnType("varchar(256)");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("longtext");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("longtext");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("longtext");

                    b.Property<bool>("ToSAccepted")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("UserName")
                        .HasMaxLength(256)
                        .HasColumnType("varchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasDatabaseName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasDatabaseName("UserNameIndex");

                    b.ToTable("Users", (string)null);
                });

            modelBuilder.Entity("WebApp.API.Models.AudioFiles.AudioFile", b =>
                {
                    b.Property<Guid>("Id")
                        .HasColumnType("char(36)");

                    b.Property<float?>("Duration")
                        .HasColumnType("float");

                    b.Property<bool>("IsPreprocessingFinished")
                        .HasColumnType("tinyint(1)");

                    b.Property<double>("Latitude")
                        .HasColumnType("double");

                    b.Property<double>("Longitude")
                        .HasColumnType("double");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<Guid?>("OwnerId")
                        .HasColumnType("char(36)");

                    b.Property<Guid?>("ProjectId")
                        .HasColumnType("char(36)");

                    b.Property<int?>("SampleRate")
                        .HasColumnType("int");

                    b.Property<DateTime?>("StartedOn")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("UploadedOn")
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.HasIndex("OwnerId");

                    b.HasIndex("ProjectId");

                    b.ToTable("AudioFiles");
                });

            modelBuilder.Entity("WebApp.API.Models.AudioFiles.UserAudioFile", b =>
                {
                    b.Property<Guid>("UserId")
                        .HasColumnType("char(36)");

                    b.Property<Guid>("FileId")
                        .HasColumnType("char(36)");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("UserId", "FileId");

                    b.HasIndex("FileId");

                    b.ToTable("UserAudioFiles");
                });

            modelBuilder.Entity("WebApp.API.Models.Birds.BirdFamily", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<string>("FamilyName")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.ToTable("BirdFamilies");
                });

            modelBuilder.Entity("WebApp.API.Models.Birds.BirdSpecies", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<string>("CommonName")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int?>("EuringNumber")
                        .HasColumnType("int");

                    b.Property<Guid>("FamilyId")
                        .HasColumnType("char(36)");

                    b.Property<string>("SpeciesName")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("FamilyId");

                    b.ToTable("BirdSpecies");
                });

            modelBuilder.Entity("WebApp.API.Models.Classification.ClassificationReport", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<Guid>("ClassifierId")
                        .HasColumnType("char(36)");

                    b.Property<Guid>("FileId")
                        .HasColumnType("char(36)");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("ClassifierId");

                    b.HasIndex("FileId");

                    b.ToTable("ClassificationReports");
                });

            modelBuilder.Entity("WebApp.API.Models.Classification.NetworkModel", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<Guid?>("CreatorId")
                        .HasColumnType("char(36)");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("Format")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int>("FrameDuration")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasDefaultValue(2);

                    b.Property<int>("FrameOverlap")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasDefaultValue(1);

                    b.Property<string>("IsPublic")
                        .IsRequired()
                        .HasColumnType("varchar(1)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.HasIndex("CreatorId");

                    b.HasIndex("Name");

                    b.ToTable("NetworkModels");
                });

            modelBuilder.Entity("WebApp.API.Models.LabelSets.Label", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<string>("AltName")
                        .HasColumnType("longtext");

                    b.Property<Guid>("LabelSetId")
                        .HasColumnType("char(36)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("LabelSetId");

                    b.ToTable("Labels");
                });

            modelBuilder.Entity("WebApp.API.Models.LabelSets.LabelSet", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<Guid?>("CreatorId")
                        .HasColumnType("char(36)");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("IsPublic")
                        .IsRequired()
                        .HasColumnType("varchar(1)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("CreatorId");

                    b.ToTable("LabelSets");
                });

            modelBuilder.Entity("WebApp.API.Models.Projects.Project", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<string>("Description")
                        .HasColumnType("longtext");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<Guid>("OwnerId")
                        .HasColumnType("char(36)");

                    b.Property<Guid?>("PrimaryLabelSetId")
                        .HasColumnType("char(36)");

                    b.Property<Guid?>("SecondaryLabelSetId")
                        .HasColumnType("char(36)");

                    b.HasKey("Id");

                    b.HasIndex("OwnerId");

                    b.HasIndex("PrimaryLabelSetId");

                    b.HasIndex("SecondaryLabelSetId");

                    b.ToTable("Projects");
                });

            modelBuilder.Entity("WebApp.API.Models.Projects.UserProject", b =>
                {
                    b.Property<Guid>("UserId")
                        .HasColumnType("char(36)");

                    b.Property<Guid>("ProjectId")
                        .HasColumnType("char(36)");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("UserId", "ProjectId");

                    b.HasIndex("ProjectId");

                    b.ToTable("UserProjects");
                });

            modelBuilder.Entity("WebApp.API.Models.SoundTypes.SoundType", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(36)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.ToTable("SoundTypes");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<System.Guid>", b =>
                {
                    b.HasOne("WebApp.API.Models.ApplicationRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<System.Guid>", b =>
                {
                    b.HasOne("WebApp.API.Models.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<System.Guid>", b =>
                {
                    b.HasOne("WebApp.API.Models.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<System.Guid>", b =>
                {
                    b.HasOne("WebApp.API.Models.ApplicationRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WebApp.API.Models.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<System.Guid>", b =>
                {
                    b.HasOne("WebApp.API.Models.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("WebApp.API.Models.ApplicationUser", b =>
                {
                    b.OwnsOne("WebApp.API.Models.Address", "Address", b1 =>
                        {
                            b1.Property<Guid>("ApplicationUserId")
                                .HasColumnType("char(36)");

                            b1.Property<string>("Country")
                                .IsRequired()
                                .HasColumnType("longtext");

                            b1.Property<int?>("HouseNumber")
                                .HasColumnType("int");

                            b1.Property<string>("PostalCode")
                                .IsRequired()
                                .HasColumnType("longtext");

                            b1.Property<string>("Street")
                                .IsRequired()
                                .HasColumnType("longtext");

                            b1.HasKey("ApplicationUserId");

                            b1.ToTable("Addresses", (string)null);

                            b1.WithOwner()
                                .HasForeignKey("ApplicationUserId");
                        });

                    b.Navigation("Address")
                        .IsRequired();
                });

            modelBuilder.Entity("WebApp.API.Models.AudioFiles.AudioFile", b =>
                {
                    b.HasOne("WebApp.API.Models.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("OwnerId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.HasOne("WebApp.API.Models.Projects.Project", null)
                        .WithMany("Files")
                        .HasForeignKey("ProjectId");

                    b.OwnsMany("WebApp.API.Models.Annotations.Annotation", "Annotations", b1 =>
                        {
                            b1.Property<Guid>("Id")
                                .HasColumnType("char(36)");

                            b1.Property<Guid?>("AnnotatorId")
                                .HasColumnType("char(36)");

                            b1.Property<DateTime>("CreatedAt")
                                .HasColumnType("datetime(6)");

                            b1.Property<Guid>("FileId")
                                .HasColumnType("char(36)");

                            b1.Property<Guid?>("SoundTypeId")
                                .HasColumnType("char(36)");

                            b1.Property<Guid?>("SpeciesId")
                                .HasColumnType("char(36)");

                            b1.HasKey("Id");

                            b1.HasIndex("AnnotatorId");

                            b1.HasIndex("FileId");

                            b1.HasIndex("SoundTypeId");

                            b1.HasIndex("SpeciesId");

                            b1.ToTable("Annotation");

                            b1.HasOne("WebApp.API.Models.ApplicationUser", "Annotator")
                                .WithMany()
                                .HasForeignKey("AnnotatorId")
                                .OnDelete(DeleteBehavior.SetNull);

                            b1.WithOwner("File")
                                .HasForeignKey("FileId");

                            b1.HasOne("WebApp.API.Models.SoundTypes.SoundType", "SoundType")
                                .WithMany()
                                .HasForeignKey("SoundTypeId");

                            b1.HasOne("WebApp.API.Models.Birds.BirdSpecies", "Species")
                                .WithMany()
                                .HasForeignKey("SpeciesId");

                            b1.OwnsOne("WebApp.API.Models.Annotations.AnnotationLabel", "Primary", b2 =>
                                {
                                    b2.Property<Guid>("AnnotationId")
                                        .HasColumnType("char(36)");

                                    b2.Property<string>("AltName")
                                        .HasColumnType("longtext")
                                        .HasColumnName("PrimaryAltName");

                                    b2.Property<string>("Name")
                                        .IsRequired()
                                        .HasColumnType("longtext")
                                        .HasColumnName("PrimaryLabelName");

                                    b2.HasKey("AnnotationId");

                                    b2.ToTable("Annotation");

                                    b2.WithOwner()
                                        .HasForeignKey("AnnotationId");
                                });

                            b1.OwnsOne("WebApp.API.Models.Annotations.AnnotationLabel", "Secondary", b2 =>
                                {
                                    b2.Property<Guid>("AnnotationId")
                                        .HasColumnType("char(36)");

                                    b2.Property<string>("AltName")
                                        .HasColumnType("longtext")
                                        .HasColumnName("SecondaryAltName");

                                    b2.Property<string>("Name")
                                        .IsRequired()
                                        .HasColumnType("longtext")
                                        .HasColumnName("SecondaryLabelName");

                                    b2.HasKey("AnnotationId");

                                    b2.ToTable("Annotation");

                                    b2.WithOwner()
                                        .HasForeignKey("AnnotationId");
                                });

                            b1.OwnsMany("WebApp.API.Models.Annotations.PolygonPoint", "Points", b2 =>
                                {
                                    b2.Property<Guid>("Id")
                                        .HasColumnType("char(36)");

                                    b2.Property<Guid>("AnnotationId")
                                        .HasColumnType("char(36)");

                                    b2.Property<double>("Frequency")
                                        .HasColumnType("double");

                                    b2.Property<int>("Index")
                                        .HasColumnType("int");

                                    b2.Property<double>("Time")
                                        .HasColumnType("double");

                                    b2.HasKey("Id");

                                    b2.HasIndex("AnnotationId");

                                    b2.ToTable("PolygonPoints", (string)null);

                                    b2.WithOwner()
                                        .HasForeignKey("AnnotationId");
                                });

                            b1.Navigation("Annotator");

                            b1.Navigation("File");

                            b1.Navigation("Points");

                            b1.Navigation("Primary")
                                .IsRequired();

                            b1.Navigation("Secondary");

                            b1.Navigation("SoundType");

                            b1.Navigation("Species");
                        });

                    b.Navigation("Annotations");
                });

            modelBuilder.Entity("WebApp.API.Models.AudioFiles.UserAudioFile", b =>
                {
                    b.HasOne("WebApp.API.Models.AudioFiles.AudioFile", "File")
                        .WithMany()
                        .HasForeignKey("FileId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WebApp.API.Models.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("File");
                });

            modelBuilder.Entity("WebApp.API.Models.Birds.BirdSpecies", b =>
                {
                    b.HasOne("WebApp.API.Models.Birds.BirdFamily", "Family")
                        .WithMany()
                        .HasForeignKey("FamilyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Family");
                });

            modelBuilder.Entity("WebApp.API.Models.Classification.ClassificationReport", b =>
                {
                    b.HasOne("WebApp.API.Models.Classification.NetworkModel", null)
                        .WithMany()
                        .HasForeignKey("ClassifierId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WebApp.API.Models.AudioFiles.AudioFile", null)
                        .WithMany()
                        .HasForeignKey("FileId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.OwnsMany("WebApp.API.Models.Classification.Classification", "Classifications", b1 =>
                        {
                            b1.Property<Guid>("Id")
                                .HasColumnType("char(36)");

                            b1.Property<double>("Confidence")
                                .HasColumnType("double");

                            b1.Property<double>("FromTime")
                                .HasColumnType("double");

                            b1.Property<string>("Label")
                                .IsRequired()
                                .HasColumnType("longtext");

                            b1.Property<Guid>("ReportId")
                                .HasColumnType("char(36)");

                            b1.Property<double>("ToTime")
                                .HasColumnType("double");

                            b1.HasKey("Id");

                            b1.HasIndex("ReportId");

                            b1.ToTable("Classification");

                            b1.WithOwner()
                                .HasForeignKey("ReportId");
                        });

                    b.Navigation("Classifications");
                });

            modelBuilder.Entity("WebApp.API.Models.Classification.NetworkModel", b =>
                {
                    b.HasOne("WebApp.API.Models.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("CreatorId");

                    b.OwnsMany("WebApp.API.Models.Classification.NetworkModelLabel", "Labels", b1 =>
                        {
                            b1.Property<Guid>("Id")
                                .HasColumnType("char(36)");

                            b1.Property<int>("Index")
                                .HasColumnType("int");

                            b1.Property<string>("Label")
                                .IsRequired()
                                .HasColumnType("longtext");

                            b1.Property<Guid>("NetworkModelId")
                                .HasColumnType("char(36)");

                            b1.HasKey("Id");

                            b1.HasIndex("NetworkModelId");

                            b1.ToTable("NetworkModelLabel");

                            b1.WithOwner()
                                .HasForeignKey("NetworkModelId");
                        });

                    b.Navigation("Labels");
                });

            modelBuilder.Entity("WebApp.API.Models.LabelSets.Label", b =>
                {
                    b.HasOne("WebApp.API.Models.LabelSets.LabelSet", null)
                        .WithMany("Labels")
                        .HasForeignKey("LabelSetId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("WebApp.API.Models.LabelSets.LabelSet", b =>
                {
                    b.HasOne("WebApp.API.Models.ApplicationUser", "Creator")
                        .WithMany()
                        .HasForeignKey("CreatorId");

                    b.Navigation("Creator");
                });

            modelBuilder.Entity("WebApp.API.Models.Projects.Project", b =>
                {
                    b.HasOne("WebApp.API.Models.ApplicationUser", "Owner")
                        .WithMany()
                        .HasForeignKey("OwnerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WebApp.API.Models.LabelSets.LabelSet", "PrimaryLabelSet")
                        .WithMany()
                        .HasForeignKey("PrimaryLabelSetId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.HasOne("WebApp.API.Models.LabelSets.LabelSet", "SecondaryLabelSet")
                        .WithMany()
                        .HasForeignKey("SecondaryLabelSetId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.OwnsMany("WebApp.API.Models.Projects.ProjectMember", "Members", b1 =>
                        {
                            b1.Property<Guid>("UserId")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("char(36)");

                            b1.Property<Guid>("ProjectId")
                                .HasColumnType("char(36)");

                            b1.HasKey("UserId", "ProjectId");

                            b1.HasIndex("ProjectId");

                            b1.ToTable("ProjectMembers", (string)null);

                            b1.WithOwner()
                                .HasForeignKey("ProjectId");

                            b1.OwnsOne("WebApp.API.Models.Projects.ProjectRole", "Role", b2 =>
                                {
                                    b2.Property<Guid>("ProjectMemberUserId")
                                        .HasColumnType("char(36)");

                                    b2.Property<Guid>("ProjectMemberProjectId")
                                        .HasColumnType("char(36)");

                                    b2.Property<string>("Value")
                                        .IsRequired()
                                        .HasColumnType("longtext")
                                        .HasColumnName("RoleCode");

                                    b2.HasKey("ProjectMemberUserId", "ProjectMemberProjectId");

                                    b2.ToTable("ProjectMembers");

                                    b2.WithOwner()
                                        .HasForeignKey("ProjectMemberUserId", "ProjectMemberProjectId");
                                });

                            b1.Navigation("Role")
                                .IsRequired();
                        });

                    b.Navigation("Members");

                    b.Navigation("Owner");

                    b.Navigation("PrimaryLabelSet");

                    b.Navigation("SecondaryLabelSet");
                });

            modelBuilder.Entity("WebApp.API.Models.Projects.UserProject", b =>
                {
                    b.HasOne("WebApp.API.Models.Projects.Project", "Project")
                        .WithMany()
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WebApp.API.Models.ApplicationUser", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Project");

                    b.Navigation("User");
                });

            modelBuilder.Entity("WebApp.API.Models.LabelSets.LabelSet", b =>
                {
                    b.Navigation("Labels");
                });

            modelBuilder.Entity("WebApp.API.Models.Projects.Project", b =>
                {
                    b.Navigation("Files");
                });
#pragma warning restore 612, 618
        }
    }
}
