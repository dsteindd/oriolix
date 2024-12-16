using WebApp.API.Contracts;

namespace WebApp.API.Models.Projects.Rules;

public class ProjectCanOnlyBeUnsharedWithSharedUserRule : IBusinessRule
{
    private readonly Guid _memberToUnshareId;
    private readonly IEnumerable<Guid> _memberIds;

    public ProjectCanOnlyBeUnsharedWithSharedUserRule(Guid memberToUnshareId, IEnumerable<Guid> memberIds)
    {
        _memberToUnshareId = memberToUnshareId;
        _memberIds = memberIds;
    }

    public bool IsBroken => _memberIds.All(mId => mId != _memberToUnshareId);
    public string Message => "Project cannot be unshared with user which is not member of the project";
}