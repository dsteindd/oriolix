using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.API.Models.LabelSets;

namespace WebApp.API.Data.Configuration;

public class LabelEntityTypeConfiguration : IEntityTypeConfiguration<Label>
{
    public void Configure(EntityTypeBuilder<Label> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id);
        builder.Property(l => l.Name);
        builder.Property(l => l.AltName);
        builder.HasOne<LabelSet>()
            .WithMany()
            .HasForeignKey(l => l.LabelSetId);
    }
}