using WebApp.API.Contracts;

namespace WebApp.API.Models.AudioFiles.Rules;

public class AnnotationConfidenceCanOnlyBeChangedByOwnerRule : IBusinessRule
{
    private readonly Guid _annotatorId;
    private readonly Guid _changeUserId;

    public AnnotationConfidenceCanOnlyBeChangedByOwnerRule(Guid annotatorId, Guid changeUserId)
    {
        _annotatorId = annotatorId;
        _changeUserId = changeUserId;
    }

    public bool IsBroken => _annotatorId != _changeUserId;
    public string Message { get; }
}