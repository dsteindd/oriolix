namespace WebApp.API.Application;

public class InvalidCommandException : Exception
{
    public InvalidCommandException(List<string> errors)
    {
        Errors = errors;
    }

    public InvalidCommandException(params string[] errors)
    {
        Errors = errors.ToList();
    }

    public List<string> Errors { get; }
}