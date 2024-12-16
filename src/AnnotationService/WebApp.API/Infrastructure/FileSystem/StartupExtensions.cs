using Microsoft.AspNetCore.Http.Features;

namespace WebApp.API.Infrastructure.FileSystem;

public static class StartupExtensions
{
    public static IServiceCollection AddFileSystemServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        var fsSettings = new FileSystemSettings();
        configuration.Bind(nameof(FileSystemSettings), fsSettings);
        services.AddSingleton(fsSettings);


        return services;
    }

    public static IServiceCollection ConfigureFileUploadSize(this IServiceCollection services)
    {
        services.Configure<FormOptions>(options =>
        {
            options.ValueLengthLimit = int.MaxValue;
            options.MultipartBodyLengthLimit = long.MaxValue;
            options.MemoryBufferThreshold = int.MaxValue;
        });

        return services;
    }
}