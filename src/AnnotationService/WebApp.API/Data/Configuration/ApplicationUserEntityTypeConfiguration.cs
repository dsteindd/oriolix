using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebApp.API.Models;

namespace WebApp.API.Data.Configuration;

public class ApplicationUserEntityTypeConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(au => au.FirstName)
            .IsRequired();
        builder.Property(au => au.LastName)
            .IsRequired();
        builder.Property(au => au.ToSAccepted)
            .IsRequired();
        builder.Ignore(au => au.FullName);
        builder.OwnsOne(au => au.Address, addressBuilder =>
        {
            addressBuilder.ToTable("Addresses");
            addressBuilder.Property(a => a.Street)
                .IsRequired();
            addressBuilder.Property(a => a.PostalCode)
                .IsRequired();
            addressBuilder.Property(a => a.HouseNumber);
            addressBuilder.Property(a => a.Country)
                .IsRequired();
        });
    }
}