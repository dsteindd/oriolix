using WebApp.API.Contracts;

namespace WebApp.API.Models.AudioFiles.Rules;

public class ChangeConfidenceAnnotationMustExistRule : IBusinessRule
{
    private readonly Guid _annotationToChangeId;
    private readonly IEnumerable<Guid> _existingAnnotationIds;

    public ChangeConfidenceAnnotationMustExistRule(Guid annotationToChangeId, IEnumerable<Guid> existingAnnotationIds)
    {
        _annotationToChangeId = annotationToChangeId;
        _existingAnnotationIds = existingAnnotationIds;
    }

    public bool IsBroken => _existingAnnotationIds.All(id => id != _annotationToChangeId);
    public string Message => "Annotation to change confidence of must exist for the current file";
}