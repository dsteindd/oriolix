namespace WebApp.API.Application.Classification;

public class NetworkModelDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int InputImageWidth { get; set; }
    public int InputImageHeight { get; set; }
    public bool IsGrayscale { get; set; }
    public bool IsPublic { get; set; }
    public Guid CreatorId { get; set; }
    public int NumberOfLabels { get; set; }
    public bool IsOwner { get; set; }
}