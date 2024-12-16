using WebApp.API.Common;

namespace WebApp.API.Application.Classification;

public class ClassificationReportDto
{
    public Guid Id { get; set; }
    public Guid ClassifierId { get; set; }
    public Guid? FileId { get; set; } = null;
    public List<ClassificationDto> Classifications { get; set; }
    
    public string Status { get; set; }

    public ClassificationReportDto()
    {
        Classifications = new List<ClassificationDto>();
    }
}