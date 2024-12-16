using IdentityModel;
using WebApp.API.Configuration;
using WebApp.API.Models;

namespace WebApp.API.UserContext;

public class UserContextAccessor : IUserContextAccessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContextAccessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId
    {
        get
        {
            if (_httpContextAccessor
                    .HttpContext?
                    .User
                    .Claims
                    .SingleOrDefault(x => x.Type.Equals(JwtClaimTypes.Subject))?
                    .Value != null)
                return Guid.Parse(_httpContextAccessor
                    .HttpContext
                    .User
                    .Claims
                    .Single(x => x.Type.Equals(JwtClaimTypes.Subject))
                    .Value);

            throw new InvalidOperationException("User context is not available");
        }
    }

    public bool HasUserId => _httpContextAccessor
        .HttpContext?
        .User
        .Claims
        .SingleOrDefault(x => x.Type.Equals(JwtClaimTypes.Subject))?
        .Value != null;

    public bool IsAvailable => _httpContextAccessor.HttpContext != null;

    public bool IsAdmin => _httpContextAccessor
        .HttpContext?
        .User
        .IsInRole(Roles.Admin) ?? false;
}