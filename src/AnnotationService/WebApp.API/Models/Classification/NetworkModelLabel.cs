using WebApp.API.Common;

namespace WebApp.API.Models.Classification;

public class NetworkModelLabel : BaseEntity
{
    public Guid NetworkModelId { get; }
    public int Index { get; }
    public string Label { get; }

    private NetworkModelLabel()
    {
        // Only EF
    }
    
    private NetworkModelLabel(
        Guid networkModelId,
        int index,
        string label
        )
    {
        NetworkModelId = networkModelId;
        Index = index;
        Label = label;
    }

    internal static NetworkModelLabel New(Guid networkModelId, int index, string label)
    {
        return new NetworkModelLabel(networkModelId, index, label);
    }
}