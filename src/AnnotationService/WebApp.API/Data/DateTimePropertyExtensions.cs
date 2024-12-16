using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace WebApp.API.Data;

public static class DatetimePropertyExtensions
{
    public static PropertyBuilder<DateTime> ApplyUtcConversion(this PropertyBuilder<DateTime> builder)
    {
        return builder.HasConversion(
            v => v,
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
    }

    public static PropertyBuilder<DateTime?> ApplyUtcConversion(this PropertyBuilder<DateTime?> builder)
    {
        return builder.HasConversion(
            v => v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null);
    }
}