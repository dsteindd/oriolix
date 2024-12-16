using WebApp.API.Contracts;

namespace WebApp.API.Models.LabelSets.Rules;

public class LabelSetCanOnlyBeDeletedWhenNonPublicRule : IBusinessRule
{
    private readonly bool _isPublic;

    public LabelSetCanOnlyBeDeletedWhenNonPublicRule(bool isPublic)
    {
        _isPublic = isPublic;
    }

    public bool IsBroken => _isPublic;
    public string Message => "Label Set can only be removed when non-public";
}