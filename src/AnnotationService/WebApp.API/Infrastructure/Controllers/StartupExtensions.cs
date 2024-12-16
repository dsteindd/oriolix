using System.Text.Json.Serialization;
using FluentValidation.AspNetCore;
using WebApp.API.Configuration.ValidationRules;

namespace WebApp.API.Infrastructure.Controllers;

public static class StartupExtensions
{
    public static IServiceCollection AddControllersWithValidationAndJsonConfiguration(this IServiceCollection services)
    {
        services.AddControllersWithViews()
            .AddJsonOptions(x => { x.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()); })
            .AddFluentValidation(conf =>
                conf.RegisterValidatorsFromAssembly(typeof(AudioFileUploadModelRule).Assembly));

        return services;
    }
}