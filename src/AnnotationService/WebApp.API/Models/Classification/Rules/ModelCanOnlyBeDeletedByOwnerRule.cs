using WebApp.API.Contracts;

namespace WebApp.API.Models.Classification.Rules;

public class ModelCanOnlyBeDeletedByOwnerRule : IBusinessRule
{
    private readonly Guid _ownerId;
    private readonly Guid _deletorId;

    public ModelCanOnlyBeDeletedByOwnerRule(Guid ownerId, Guid deletorId)
    {
        _ownerId = ownerId;
        _deletorId = deletorId;
    }

    public bool IsBroken => _ownerId != _deletorId;
    public string Message => "Network can only be deleted by owner";
}