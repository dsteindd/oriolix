using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.API.Models;
using WebApp.API.Models.LabelSets;

namespace WebApp.API.Data.Configuration;

public class LabelSetEntityTypeConfiguration : IEntityTypeConfiguration<LabelSet>
{
    public void Configure(EntityTypeBuilder<LabelSet> builder)
    {
        builder.HasKey(ls => ls.Id);
        builder.Property(ls => ls.Id);
        builder.Property(ls => ls.Name);
        builder.Property(ls => ls.Description);
        builder.Property(ls => ls.IsPublic)
            .HasConversion<string>();

        builder.HasOne<ApplicationUser>(ls => ls.Creator)
            .WithMany()
            .HasForeignKey(ls => ls.CreatorId);

        builder.HasMany<Label>(ls => ls.Labels)
            .WithOne()
            .HasForeignKey(l => l.LabelSetId);
        
        // builder.OwnsMany<Label>(ls => ls.Labels, labelBuilder =>
        // {
        //     labelBuilder.WithOwner()
        //         .HasForeignKey(l => l.LabelSetId);
        //
        //     labelBuilder.Property(l => l.Id)
        //         .ValueGeneratedNever();
        //     labelBuilder.HasKey(l => new { l.Id, l.LabelSetId });
        //     labelBuilder.Property(l => l.Name);
        //     labelBuilder.Property(l => l.AltName);
        // });
    }
}