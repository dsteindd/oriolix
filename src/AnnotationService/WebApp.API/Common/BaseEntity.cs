using WebApp.API.Contracts;

namespace WebApp.API.Common;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = default!;

    protected BaseEntity() => Id = Guid.NewGuid();

    protected BaseEntity(Guid id) => Id = id;

    public void CheckRule(IBusinessRule businessRule)
    {
        if (businessRule.IsBroken)
        {
            throw new BusinessRuleValidationException(businessRule);
        }
    }
}