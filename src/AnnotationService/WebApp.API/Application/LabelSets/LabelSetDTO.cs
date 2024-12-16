namespace WebApp.API.Application.LabelSets;

public class LabelSetDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsPublic { get; set; }
    public List<LabelDTO> Labels { get; set; }
    public bool IsOwner { get; set; }
    public Guid CreatorId { get; set; }
}