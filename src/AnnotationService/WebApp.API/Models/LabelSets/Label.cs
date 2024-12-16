using WebApp.API.Common;

namespace WebApp.API.Models.LabelSets;

public class Label : BaseEntity
{
    public Guid LabelSetId { get; }
    public string Name { get; }
    public string? AltName { get; }

    private Label()
    {
        // Only EF
    }

    private Label(
        Guid labelSetId,
        string name,
        string? altName = null
    )
    {
        LabelSetId = labelSetId;
        Name = name;
        AltName = altName;
    }

    public static Label New(Guid labelSetId, string name, string? altName = null)
    {
        return new Label(labelSetId, name, altName);
    }
}