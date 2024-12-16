using WebApp.API.Contracts;

namespace WebApp.API.Models.AudioFiles.Rules;

public class AnnotationCanOnlyBeDeletedByOwnerRule : IBusinessRule
{
    private readonly Guid _removerId;
    private readonly Guid _annotatorId;

    public AnnotationCanOnlyBeDeletedByOwnerRule(Guid removerId, Guid annotatorId)
    {
        _removerId = removerId;
        _annotatorId = annotatorId;
    }

    public bool IsBroken => _removerId != _annotatorId;
    public string Message => "Annotation can only be deleted by owner";
}