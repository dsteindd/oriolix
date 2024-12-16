using WebApp.API.Contracts;

namespace WebApp.API.Models.AudioFiles.Rules;

public class AnnotationConfidenceMustBeBetweenOneAndFiveRule : IBusinessRule
{
    private readonly int _confidenceToSet;

    public AnnotationConfidenceMustBeBetweenOneAndFiveRule(int confidenceToSet)
    {
        _confidenceToSet = confidenceToSet;
    }

    private const int MinimumConfidence = 1;
    private const int MaximumConfidence = 5;

    public bool IsBroken => _confidenceToSet < MinimumConfidence || _confidenceToSet > MaximumConfidence;
    public string Message => $"Annotation Confidence must be between {MinimumConfidence} and {MaximumConfidence}";
}