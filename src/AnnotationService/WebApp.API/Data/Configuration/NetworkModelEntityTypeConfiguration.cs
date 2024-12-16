using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.API.Models;
using WebApp.API.Models.Classification;

namespace WebApp.API.Data.Configuration;

public class NetworkModelEntityTypeConfiguration : IEntityTypeConfiguration<NetworkModel>
{
    public void Configure(EntityTypeBuilder<NetworkModel> builder)
    {
        builder.HasKey(nm => nm.Id);
        builder.Property(nm => nm.Id);
        builder.Property(nm => nm.Name).IsRequired();
        builder.HasIndex(nm => nm.Name);
        builder.Property(nm => nm.Description);
        builder.Property(nm => nm.FrameDuration)
            .HasDefaultValue(2);
        builder.Property(nm => nm.FrameOverlap)
            .HasDefaultValue(1);

        builder.Property(nm => nm.IsPublic)
            .HasConversion<string>();
        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(nm => nm.CreatorId);

        builder.Property(nm => nm.Format)
            .HasConversion<string>();

        builder.OwnsMany<NetworkModelLabel>(nm => nm.Labels, labelBuilder =>
        {
            labelBuilder.HasKey(l => l.Id);
            labelBuilder.Property(l => l.Id)
                .ValueGeneratedNever();

            labelBuilder.Property(l => l.Label);
            labelBuilder.Property(l => l.Index);
            labelBuilder.WithOwner()
                .HasForeignKey(l => l.NetworkModelId);
        });
    }
}