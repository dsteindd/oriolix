using WebApp.API.Contracts;

namespace WebApp.API.Infrastructure.ExceptionMiddleware.ProblemDetails;

public class BusinessRuleValidationExceptionProblemDetails : Microsoft.AspNetCore.Mvc.ProblemDetails
{
    public BusinessRuleValidationExceptionProblemDetails(BusinessRuleValidationException exception)
    {
        Title = "Business rule broken";
        Status = StatusCodes.Status409Conflict;
        Detail = exception.Message;
        Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.8";
    }
}