using WebApp.API.Application.LabelSets;

namespace WebApp.API.Application.Annotations.DownloadAnnotationsZip;

public class AnnotationExportDto
{
    public Guid Id { get; set; }
    
    public AnnotationLabelDTO Primary { get; set; }
    public AnnotationLabelDTO Secondary { get; set; }

    public Guid? AnnotatorId { get; set; }
    public string AnnotatorName { get; set; }
    public Guid FileId { get; set; }
    public string FileName { get; set; }
    public List<double> Times { get; set; } = new();
    public List<double> Frequencies { get; set; } = new();

    public DateTime CreatedAt { get; set; }
}