namespace WebApp.API.Application.Annotations.DownloadAnnotationsOfFileZip;

public class ZipResult
{
    public ZipResult(Stream zipStream, string zipName)
    {
        ZipStream = zipStream;
        ZipName = zipName;
    }

    public Stream ZipStream { get; }
    public string ZipName { get; }
}