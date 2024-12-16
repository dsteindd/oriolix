namespace WebApp.API.Application.Files;

public interface IVirusScanner
{
    Task<ScanResult> ScanFile(Stream fileStream, CancellationToken cancellationToken);
}

public class ScanResult
{
    private ScanResult(
        bool ok,
        string? message
    )
    {
        Ok = ok;
        Message = message;
    }

    public bool Ok { get; }

    public string? Message { get; }

    public static ScanResult Clean()
    {
        return new ScanResult(true, null);
    }

    public static ScanResult Virus(string message)
    {
        return new ScanResult(false, message);
    }

    public static ScanResult Error(string message)
    {
        return new ScanResult(false, message);
    }
}