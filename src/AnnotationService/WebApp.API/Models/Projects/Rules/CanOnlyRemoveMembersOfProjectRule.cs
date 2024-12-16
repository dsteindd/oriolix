using WebApp.API.Contracts;

namespace WebApp.API.Models.Projects.Rules;

public class CanOnlyRemoveMembersOfProjectRule : IBusinessRule
{
    private readonly Guid _userId;
    private readonly IEnumerable<Guid> _memberIds;

    public CanOnlyRemoveMembersOfProjectRule(Guid userId, IEnumerable<Guid> memberIds)
    {
        _userId = userId;
        _memberIds = memberIds;
    }

    public bool IsBroken => _memberIds.All(mId => mId != _userId);
    public string Message => $"User with id {_userId} is not part of the project you attempt to delete him from";
}