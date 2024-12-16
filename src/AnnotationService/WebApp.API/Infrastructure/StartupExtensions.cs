using WebApp.API.EventBus;
using WebApp.API.Infrastructure.Controllers;
using WebApp.API.Infrastructure.DataProtection;
using WebApp.API.Infrastructure.ExceptionMiddleware;
using WebApp.API.Infrastructure.FileSystem;
using WebApp.API.Infrastructure.Identity;
using WebApp.API.Infrastructure.Mails;
using WebApp.API.Infrastructure.Mapping;
using WebApp.API.Infrastructure.Mediation;
using WebApp.API.Infrastructure.Persistence;
using WebApp.API.Infrastructure.VirusScanner;

namespace WebApp.API.Infrastructure;

public static class StartupExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        services
            .AddEventBus(configuration)
            .AddIntegrationEvents()
            .AddDatabaseContext(configuration, environment)
            .AddIdentityAndIdentityServer(configuration)
            .AddDataProtection(configuration)
            .AddMailSender(configuration, environment)
            .AddClamVirusScanner(configuration)
            .AddMediation(configuration)
            .AddMapper()
            .AddFileSystemServices(configuration)
            .ConfigureFileUploadSize()
            .AddControllersWithValidationAndJsonConfiguration()
            .AddProblemDetailsMiddleware();

        return services;
    }
}