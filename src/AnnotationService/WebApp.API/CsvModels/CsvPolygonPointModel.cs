namespace WebApp.API.CsvModels;

public class CsvPolygonPointModel
{
    public Guid AnnotationId { get; set; }
    public double Time { get; set; }
    public double Frequency { get; set; }
    public int Index { get; set; }
}