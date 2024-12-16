namespace WebApp.API.Common;

public abstract class AuditableEntity : BaseEntity, IAuditableEntity
{
    public Guid CreatedBy { get; set; }
    public DateTime CreatedOn { get; }
    public Guid LastModifiedBy { get; set; }
    public DateTime? LastModifiedOn { get; set; }

    protected AuditableEntity() : base()
    {
        CreatedOn = DateTime.UtcNow;
        LastModifiedOn = DateTime.UtcNow;
    }
}