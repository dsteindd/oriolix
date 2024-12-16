using WebApp.API.Common;
using WebApp.API.Models.LabelSets.Rules;

namespace WebApp.API.Models.LabelSets;

public class LabelSet : BaseEntity
{
    public string Name { get; }
    public string Description { get; }
    public bool IsPublic { get; }
    public Guid? CreatorId { get; }
    public ApplicationUser? Creator { get; }

    public List<Label> Labels { get; }

    private LabelSet()
    {
        // Only EF
    }

    private LabelSet(
        string name,
        string description,
        bool isPublic,
        Guid? creatorId = null
    )
    {
        Name = name;
        Description = description;
        IsPublic = isPublic;
        CreatorId = creatorId;
        Labels = new List<Label>();
    }

    public static LabelSet New(
        string name,
        string description,
        bool isPublic,
        Guid? creatorId = null
    )
    {
        return new LabelSet(name, description, isPublic, creatorId);
    }

    public void AddLabel(string name, string? altName)
    {
        var label = Label.New(this.Id, name, altName);
        Labels.Add(label);
    }

    public void Delete(Guid deletorId)
    {
        this.CheckRule(new LabelSetCanOnlyBeDeletedByOwner(deletorId, CreatorId!.Value));
        this.CheckRule(new LabelSetCanOnlyBeDeletedWhenNonPublicRule(IsPublic));
    }
}