using Hellang.Middleware.ProblemDetails;
using WebApp.API.Application;
using WebApp.API.Contracts;
using WebApp.API.Infrastructure.ExceptionMiddleware.ProblemDetails;

namespace WebApp.API.Infrastructure.ExceptionMiddleware;

public static class StartupExtensions
{
    public static IServiceCollection AddProblemDetailsMiddleware(this IServiceCollection services)
    {
        services
            .AddProblemDetails(x =>
            {
                x.Map<BusinessRuleValidationException>(ex => new BusinessRuleValidationExceptionProblemDetails(ex));
                x.Map<InvalidCommandException>(ex => new InvalidCommandExceptionProblemDetails(ex));
            });

        return services;
    }
}