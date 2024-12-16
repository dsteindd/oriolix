using WebApp.API.Contracts;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Projects.ShareProject.Rules;

public class ProjectCanOnlyBeSharedByOwnerRule : IBusinessRule
{
    private readonly Guid? _ownerId;
    private readonly Guid _sharerId;

    public ProjectCanOnlyBeSharedByOwnerRule(Guid? ownerId, Guid sharerId)
    {
        _ownerId = ownerId;
        _sharerId = sharerId;
    }


    public bool IsBroken => _sharerId != _ownerId;
    public string Message => "Projects can only be shared by owner";
}