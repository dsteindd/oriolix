namespace WebApp.API.Data.Seed;

public class LabelSetsSeed
{
    public static LabelSetData BirdLabelSet => new LabelSetData()
    {
        Name = "Bird Species with german translation",
        Description = "281 Bird Species Labels"
    };

    public static LabelSetData SoundTypeLabelSet => new LabelSetData()
    {
        Name = "Bird Sound Types",
        Description = "Just a collection of sound types, e.g. call or song",
        Labels = new List<LabelData>()
        {
            new LabelData()
            {
                Name = "Song",
                AltName = "Gesang"
            },
            new LabelData()
            {
                Name = "Call",
                AltName = "Ruf"
            }
        }
    };
}

public class LabelSetData
{
    public string Name { get; internal set; }
    public string Description { get; internal set; }
    public List<LabelData> Labels { get; internal set; } = new List<LabelData>();
}

public class LabelData
{
    public string Name { get; internal set; }
    public string AltName { get; internal set; }
}