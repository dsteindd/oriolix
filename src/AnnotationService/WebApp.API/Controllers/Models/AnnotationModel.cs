using WebApp.API.Application.Annotations;

namespace WebApp.API.Controllers.Models;

public class AnnotationModel
{
    public Guid PrimaryLabelId { get; set; }
    public Guid? SecondaryLabelId { get; set; } = null;

    public List<PolygonPointDto> Points { get; set; } = new List<PolygonPointDto>();
}