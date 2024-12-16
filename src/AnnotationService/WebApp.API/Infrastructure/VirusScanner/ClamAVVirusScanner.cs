using nClam;
using WebApp.API.Application.Files;

namespace WebApp.API.Infrastructure.VirusScanner;

public class ClamAVVirusScanner : IVirusScanner
{
    private readonly IClamClient _client;

    public ClamAVVirusScanner(IClamClient client)
    {
        _client = client;
    }

    public async Task<ScanResult> ScanFile(Stream fileStream, CancellationToken cancellationToken)
    {
        try
        {
            var scanResult = await _client.SendAndScanFileAsync(fileStream, cancellationToken);

            switch (scanResult.Result)
            {
                case ClamScanResults.Clean:
                    return ScanResult.Clean();
                case ClamScanResults.VirusDetected:
                    return ScanResult.Virus(
                        $"Virus Found! Virus name: {scanResult.InfectedFiles?.First().VirusName}");
                case ClamScanResults.Error:
                    return ScanResult.Error("An error occured scanning the file!");
                case ClamScanResults.Unknown:
                    return ScanResult.Error("Unknown scan result while scanning the file!");
                default:
                    return ScanResult.Error("Unknown Scan Result");
            }
        }
        catch (Exception)
        {
            return ScanResult.Error("Unable to process file, please try later!");
        }
    }
}