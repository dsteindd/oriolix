namespace WebApp.API.Application.Projects;

public class ProjectDTO
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public Guid? PrimaryLabelSetId { get; set; }
    public Guid? SecondaryLabelSetId { get; set; }
    public bool IsOwner { get; set; }
}