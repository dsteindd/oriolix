namespace WebApp.API.Infrastructure.Mapping;

public static class StartupExtensions
{
    public static IServiceCollection AddMapper(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(Program));

        return services;
    }
}