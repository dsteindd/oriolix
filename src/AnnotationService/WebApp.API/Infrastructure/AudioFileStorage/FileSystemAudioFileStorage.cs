using Microsoft.AspNetCore.StaticFiles;
using WebApp.API.Infrastructure.FileSystem;
using WebApp.API.Models.AudioFiles;
using WebApp.API.Services;

namespace WebApp.API.Infrastructure.AudioFileStorage;

public class FileSystemAudioFileStorage : IAudioFileStorage
{
    private const string SubFolder = "";
    private readonly string _basePath;
    private const string DenoisedSub = "_denoised";
    private const string ImageExtension = ".png";

    public FileSystemAudioFileStorage(FileSystemSettings settings, IWebHostEnvironment environment)
    {
        _basePath = Path.Join(environment.ContentRootPath, settings.PathPrefix, SubFolder);

        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public void SaveAudioFile(Stream audioFile, Guid audioFileId, AudioFileFormat format)
    {
        using var fileStream = File.Create(GetAudioFileUri(audioFileId, format));
        audioFile.CopyTo(fileStream);
        fileStream.Flush();
    }

    public void DeleteAudioFile(Guid audioFileId, AudioFileFormat format)
    {
        File.Delete(GetAudioFileUri(audioFileId, format));
        if (File.Exists(GetSpectrogramUri(audioFileId)))
        {
            File.Delete(GetSpectrogramUri(audioFileId));
        }

        if (File.Exists(GetDenoisedAudioFileUri(audioFileId, format)))
        {
            File.Delete(GetDenoisedAudioFileUri(audioFileId, format));
        }

        if (File.Exists(GetDenoisedSpectrogramUri(audioFileId)))
        {
            File.Delete(GetDenoisedSpectrogramUri(audioFileId));
        }
    }

    public string GetAudioFileUri(Guid audioFileId, AudioFileFormat format)
    {
        var ext = "." + format.ToString().ToLowerInvariant();

        return Path.Join(
            _basePath,
            audioFileId + ext
        );
    }

    public string GetDenoisedAudioFileUri(Guid audioFileId, AudioFileFormat format)
    {
        var ext = "." + format.ToString().ToLowerInvariant();

        return Path.Join(
            _basePath,
            audioFileId + DenoisedSub + ext
        );
    }

    public string GetSpectrogramUri(Guid audioFileId)
    {
        return Path.Join(
            _basePath,
            audioFileId + ImageExtension
        );
    }

    public string GetDenoisedSpectrogramUri(Guid audioFileId)
    {
        return Path.Join(
            _basePath,
            audioFileId + DenoisedSub + ImageExtension
        );
    }

    public bool DoesAudioFileExist(Guid audioFileId, AudioFileFormat format)
    {
        return File.Exists(GetAudioFileUri(audioFileId, format));
    }

    DownloadFileResult IAudioFileStorage.DownloadAudioFile(Guid audioFileId, AudioFileFormat format)
    {
        var path = GetAudioFileUri(audioFileId, format);
        return Download(path);
    }

    DownloadFileResult IAudioFileStorage.DownloadDenoisedAudioFile(Guid audioFileId, AudioFileFormat format)
    {
        var path = GetAudioFileUri(audioFileId, format);
        return Download(path);
    }

    private DownloadFileResult Download(string path)
    {
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(path, out var contentType)) contentType = "application/octet-stream";

        var fileStream = new FileStream(path, FileMode.Open, FileAccess.Read);
        
        return new DownloadFileResult
        {
            ContentType = contentType,
            Content = fileStream,
        };
    }
}