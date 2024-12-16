using MediatR;

namespace WebApp.API.Infrastructure.Mediation;

public static class StartupExtensions
{
    public static IServiceCollection AddMediation(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMediatR(typeof(Program));
        services.AddSingleton<IPublisher, NonBlockingPublisher>();

        return services;
    }
}