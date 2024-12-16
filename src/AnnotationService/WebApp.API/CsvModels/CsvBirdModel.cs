namespace WebApp.API.CsvModels;

public class CsvBirdModel
{
    public int EuringNumber { get; set; }
    public string Family { get; set; } = null!;
    public string Species { get; set; } = null!;
    public string CommonName { get; set; } = null!;
}