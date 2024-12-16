using WebApp.API.Application;

namespace WebApp.API.Infrastructure.ExceptionMiddleware.ProblemDetails;

public class InvalidCommandExceptionProblemDetails : Microsoft.AspNetCore.Mvc.ProblemDetails
{
    public InvalidCommandExceptionProblemDetails(InvalidCommandException exception)
    {
        Title = "Command validation error";
        Status = StatusCodes.Status400BadRequest;
        Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.4";
        Errors = exception.Errors;
    }

    public List<string> Errors { get; }
}