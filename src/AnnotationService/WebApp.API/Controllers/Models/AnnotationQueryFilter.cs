namespace WebApp.API.Controllers.Models;

public class AnnotationQueryFilter
{
    public Guid? SpeciesId { get; set; } = null;
    public Guid? AnnotatorId { get; set; } = null;
}