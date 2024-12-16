namespace WebApp.API.Services;

public class DownloadFileResult
{
    public Stream Content { get; set; }
    public string ContentType { get; set; }
    public string FileName { get; set; }
}