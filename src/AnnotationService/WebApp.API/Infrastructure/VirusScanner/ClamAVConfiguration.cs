namespace WebApp.API.Infrastructure.VirusScanner;

public class ClamAVConfiguration
{
    public string Server { get; set; } = null!;
    public int Port { get; set; }
}