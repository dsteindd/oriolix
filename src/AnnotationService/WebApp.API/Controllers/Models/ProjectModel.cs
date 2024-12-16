namespace WebApp.API.Controllers.Models;

public class ProjectModel
{
    public string Name { get; set; }
    public string? Description { get; set; }
    public Guid PrimaryLabelSetId { get; set; }
    
    public Guid? SecondaryLabelSetId { get; set; }
}