using WebApp.API.Contracts;

namespace WebApp.API.Models.Projects.Rules;

public class ProjectCanOnlyBeSharedOnceRule : IBusinessRule
{
    private readonly Guid _userId;
    private readonly IEnumerable<Guid> _memberIds;

    public ProjectCanOnlyBeSharedOnceRule(Guid userId, IEnumerable<Guid> memberIds)
    {
        _userId = userId;
        _memberIds = memberIds;
    }

    public bool IsBroken => _memberIds.Any(mId => mId == _userId);
    public string Message => $"Project is already shared with the user with id {_userId}";
}