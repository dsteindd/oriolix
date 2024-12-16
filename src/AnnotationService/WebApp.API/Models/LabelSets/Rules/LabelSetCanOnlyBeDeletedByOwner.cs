using WebApp.API.Contracts;

namespace WebApp.API.Models.LabelSets.Rules;

public class LabelSetCanOnlyBeDeletedByOwner : IBusinessRule
{
    private readonly Guid _deletorId;
    private readonly Guid _ownerId;

    public LabelSetCanOnlyBeDeletedByOwner(Guid deletorId, Guid ownerId)
    {
        _deletorId = deletorId;
        _ownerId = ownerId;
    }

    public bool IsBroken => _deletorId != _ownerId;
    public string Message => "Label Set can only be deleted by owner";
}