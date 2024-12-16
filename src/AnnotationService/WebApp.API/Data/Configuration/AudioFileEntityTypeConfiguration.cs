using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.API.Models;
using WebApp.API.Models.Annotations;
using WebApp.API.Models.AudioFiles;

namespace WebApp.API.Data.Configuration;

public class AudioFileEntityTypeConfiguration : IEntityTypeConfiguration<AudioFile>
{
    public void Configure(EntityTypeBuilder<AudioFile> builder)
    {
        builder.HasKey(af => af.Id);
        builder.Property(af => af.Id)
            .ValueGeneratedNever();
        builder.Property(af => af.Name);
        builder.Property(af => af.Format)
            .HasConversion<string>();
        
        
        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(af => af.OwnerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(af => af.Latitude);
        builder.Property(af => af.Longitude);

        builder.Property(af => af.Duration);
        builder.Property(af => af.SampleRate);

        builder.Property(af => af.IsPreprocessingFinished);

        builder.OwnsMany(af => af.Annotations, annotationBuilder =>
        {
            annotationBuilder.Property(a => a.Id)
                .ValueGeneratedNever();

            annotationBuilder.WithOwner()
                .HasForeignKey(a => a.FileId);

            annotationBuilder.Property(a => a.Confidence)
                .HasDefaultValue(5);

            annotationBuilder.HasKey(a => a.Id);
            annotationBuilder.Property(a => a.CreatedAt)
                .ApplyUtcConversion();
            annotationBuilder.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(a => a.AnnotatorId)
                .OnDelete(DeleteBehavior.SetNull);
            annotationBuilder.HasOne(a => a.File)
                .WithMany(af => af.Annotations)
                .HasForeignKey(a => a.FileId)
                .IsRequired();
            
            
            annotationBuilder.OwnsOne(a => a.Primary, labelBuilder =>
            {
                labelBuilder.Property(pl => pl.Name).HasColumnName("PrimaryLabelName");
                labelBuilder.Property(pl => pl.AltName).HasColumnName("PrimaryAltName");
            });
            
            annotationBuilder.OwnsOne(a => a.Secondary, labelBuilder =>
            {
                labelBuilder.Property(pl => pl.Name).HasColumnName("SecondaryLabelName");
                labelBuilder.Property(pl => pl.AltName).HasColumnName("SecondaryAltName");
            });

            annotationBuilder.OwnsMany(a => a.Points, polygonBuilder =>
            {
                polygonBuilder.ToTable("PolygonPoints");

                polygonBuilder.Property(p => p.AnnotationId)
                    .ValueGeneratedNever();
                polygonBuilder.Property(p => p.Id)
                    .ValueGeneratedNever();

                polygonBuilder.WithOwner()
                    .HasForeignKey(p => p.AnnotationId);

                polygonBuilder.HasKey(p => p.Id);

                polygonBuilder.Property(p => p.Time);
                polygonBuilder.Property(p => p.Frequency);
                polygonBuilder.Property(p => p.Index);
            });
        });

        builder.Property(af => af.UploadedOn)
            .ApplyUtcConversion();
        builder.Property(af => af.StartedOn)
            .ApplyUtcConversion();
    }
}