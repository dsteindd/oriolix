namespace WebApp.API.CsvModels;

public class CsvAnnotationModel
{
    public Guid Id { get; set; }
    public Guid SpeciesId { get; set; }
    public string SpeciesName { get; set; } = null!;

    public Guid AnnotatorId { get; set; }
    public Guid FileId { get; set; }
    public DateTime CreatedAt { get; set; }
}