using WebApp.API.Application.Users.GetUsers;

namespace WebApp.API.Application.Annotations;

public class AnnotationDto
{
    public Guid Id { get; set; }
    public Guid SpeciesId { get; set; }
    public string SpeciesName { get; set; } = null!;

    public Guid? AnnotatorId { get; set; }
    public string AnnotatorFullName { get; set; }
    public Guid FileId { get; set; }
    public List<PolygonPointDto> Points { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    
    public AnnotationLabelDTO PrimaryLabel { get; set; } 
    public AnnotationLabelDTO? SecondaryLabel { get; set; }
    public int Confidence { get; set; }
    
    public bool IsOwned { get; set; }
}