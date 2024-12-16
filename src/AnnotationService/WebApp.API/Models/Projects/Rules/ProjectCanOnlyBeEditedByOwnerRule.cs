using WebApp.API.Contracts;

namespace WebApp.API.Models.Projects.Rules;

public class ProjectCanOnlyBeEditedByOwnerRule : IBusinessRule
{
    private readonly Guid _ownerId;
    private readonly Guid _editorId;

    public ProjectCanOnlyBeEditedByOwnerRule(Guid ownerId, Guid editorId)
    {
        _ownerId = ownerId;
        _editorId = editorId;
    }

    public bool IsBroken => _ownerId != _editorId;
    public string Message => "Project can only be edited by owner";
}