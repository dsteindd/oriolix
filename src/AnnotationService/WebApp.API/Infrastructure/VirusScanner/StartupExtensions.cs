using nClam;
using WebApp.API.Application.Files;

namespace WebApp.API.Infrastructure.VirusScanner;

public static class StartupExtensions
{
    public static IServiceCollection AddClamVirusScanner(this IServiceCollection services, IConfiguration configuration)
    {
        var clamAVConfiguration = new ClamAVConfiguration();
        configuration.Bind(nameof(ClamAVConfiguration), clamAVConfiguration);

        services.AddScoped<IVirusScanner, ClamAVVirusScanner>();
        services.AddScoped<IClamClient>(_ => new ClamClient(clamAVConfiguration.Server, clamAVConfiguration.Port));

        return services;
    }
}