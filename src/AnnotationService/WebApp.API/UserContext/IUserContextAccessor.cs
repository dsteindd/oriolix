namespace WebApp.API.UserContext;

public interface IUserContextAccessor
{
    public Guid UserId { get; }

    public bool HasUserId { get; }

    public bool IsAvailable { get; }

    public bool IsAdmin { get; }
}