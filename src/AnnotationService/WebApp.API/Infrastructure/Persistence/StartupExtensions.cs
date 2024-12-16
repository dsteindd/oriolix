using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;

namespace WebApp.API.Infrastructure.Persistence;

public static class StartupExtensions
{
    public static IServiceCollection AddDatabaseContext(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment
    )
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseMySql(connectionString, new MariaDbServerVersion(new Version(10, 5)));
            if (environment.IsDevelopment())
            {
                options.EnableDetailedErrors();
                options.EnableSensitiveDataLogging();
            }
        });

        if (environment.IsDevelopment()) services.AddDatabaseDeveloperPageExceptionFilter();

        return services;
    }
}