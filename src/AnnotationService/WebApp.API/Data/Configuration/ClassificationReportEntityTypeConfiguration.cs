using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.API.Models.AudioFiles;
using WebApp.API.Models.Classification;

namespace WebApp.API.Data.Configuration;

public class ClassificationReportEntityTypeConfiguration : IEntityTypeConfiguration<ClassificationReport>
{
    public void Configure(EntityTypeBuilder<ClassificationReport> builder)
    {
        builder.HasKey(cp => cp.Id);
        builder.HasOne<AudioFile>()
            .WithMany()
            .HasForeignKey(cp => cp.FileId);
        builder.HasOne<NetworkModel>()
            .WithMany()
            .HasForeignKey(cp => cp.ClassifierId)
            .IsRequired();

        builder.Property(cp => cp.Status)
            .HasConversion<string>();
        
        builder.OwnsMany<Classification>(cp => cp.Classifications, classificationBuilder =>
        {
            classificationBuilder.WithOwner()
                .HasForeignKey(c => c.ReportId);

            classificationBuilder.HasKey(c => c.Id);
            classificationBuilder.Property(c => c.Id)
                .ValueGeneratedNever();

            classificationBuilder.Property(c => c.FromTime);
            classificationBuilder.Property(c => c.ToTime);
            classificationBuilder.Property(c => c.Label);
            classificationBuilder.Property(c => c.Confidence);
        });
    }
}