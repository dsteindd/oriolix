using WebApp.API.Contracts;

namespace WebApp.API.Models.Projects.Rules;

public class ProjectCanOnlyBeDeletedByOwnerRule : IBusinessRule
{
    private readonly Guid _ownerId;
    private readonly Guid _deletorId;

    public ProjectCanOnlyBeDeletedByOwnerRule(Guid ownerId, Guid deletorId)
    {
        _deletorId = deletorId;
        _ownerId = ownerId;
    }

    public bool IsBroken => _deletorId != _ownerId;
    public string Message => "Project can only be deleted by owner";
}