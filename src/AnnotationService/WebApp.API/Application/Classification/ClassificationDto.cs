namespace WebApp.API.Application.Classification;

public class ClassificationDto
{
    public double FromTime { get; set; }
    public double ToTime { get; set; }
    public string Label { get; set; }
    public double Confidence { get; set; }
}