using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.API.Application.LabelSets;
using WebApp.API.Models;
using WebApp.API.Models.AudioFiles;
using WebApp.API.Models.LabelSets;
using WebApp.API.Models.Projects;

namespace WebApp.API.Data.Configuration;

public class ProjectEntityTypeConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id);
        builder.Property(p => p.Name);
        builder.Property(p => p.Description);
        builder.Property(p => p.OwnerId);
        builder.Property(p => p.OwnerName);

        builder.HasMany<AudioFile>(p => p.Files)
            .WithOne()
            .HasForeignKey(af => af.ProjectId);

        builder.HasOne<LabelSet>(p => p.PrimaryLabelSet)
            .WithMany()
            .HasForeignKey(p => p.PrimaryLabelSetId)
            .OnDelete(DeleteBehavior.SetNull);
        
        builder.HasOne<LabelSet>(p => p.SecondaryLabelSet)
            .WithMany()
            .HasForeignKey(p => p.SecondaryLabelSetId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.OwnsMany<ProjectMember>(p => p.Members, memberBuilder =>
        {
            memberBuilder.WithOwner()
                .HasForeignKey(m => m.ProjectId);
            memberBuilder.ToTable("ProjectMembers");
            memberBuilder.Property(m => m.ProjectId)
                .ValueGeneratedNever();
            memberBuilder.Property(m => m.UserId)
                .ValueGeneratedNever();
            memberBuilder.Property(m => m.UserName);
            memberBuilder.HasKey(m => new { m.UserId, m.ProjectId });
            memberBuilder.OwnsOne<ProjectRole>(m => m.Role, roleBuilder =>
            {
                roleBuilder.Property(r => r.Value).HasColumnName("RoleCode");
            });
        });
    }
}