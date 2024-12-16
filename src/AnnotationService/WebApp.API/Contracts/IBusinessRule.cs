namespace WebApp.API.Contracts;

public interface IBusinessRule
{
    bool IsBroken { get; }
    string Message { get; }
}