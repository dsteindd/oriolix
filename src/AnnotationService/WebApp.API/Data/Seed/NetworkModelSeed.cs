using WebApp.API.Models.Classification;

namespace WebApp.API.Data.Seed;

public static class NetworkModelSeed
{
    public static List<NetworkModelData> Dates => new List<NetworkModelData>()
    {
        new NetworkModelData()
        {
            Format = ModelFormat.H5,
            Name = "BirdNET Architecture v1.0",
            Description = "Version v1.0 of the BirdNet Architecture trained on Xeno Canto data. " +
                          "The model can only predict exactly one class label for any 3s excerpt of an spectrogram",
            LoadModelPath = "assets/networks/BirdNetMultiLabel.h5",
            LoadLabelPath = "assets/networks/BirdNetSoftmax.txt",
            IsPublic = true,
            CreatorId = null,
            FrameDuration = 2,
            FrameOverlap = 1,
        }
    };
}

public class NetworkModelData
{
    public ModelFormat Format { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    
    public string LoadModelPath { get; set; }
    public string LoadLabelPath { get; set; }
    public bool IsPublic { get; set; }
    public Guid? CreatorId { get; set; }
    public int FrameDuration { get; set; } = 2;
    public int FrameOverlap { get; set; } = 1;

}