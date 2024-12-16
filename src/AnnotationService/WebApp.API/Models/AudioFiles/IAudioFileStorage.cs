using WebApp.API.Services;

namespace WebApp.API.Models.AudioFiles;

public interface IAudioFileStorage
{
    public void SaveAudioFile(Stream audioFile, Guid audioFileId, AudioFileFormat format);

    public void DeleteAudioFile(Guid audioFileId, AudioFileFormat format);
    
    public string GetAudioFileUri(Guid audioFileId, AudioFileFormat format);

    public string GetDenoisedAudioFileUri(Guid audioFileId, AudioFileFormat format);
    public string GetSpectrogramUri(Guid audioFileId);
    public string GetDenoisedSpectrogramUri(Guid audioFileId);
    
    public bool DoesAudioFileExist(Guid audioFileId, AudioFileFormat format);

    internal DownloadFileResult DownloadAudioFile(Guid audioFileId, AudioFileFormat format);
    
    internal DownloadFileResult DownloadDenoisedAudioFile(Guid audioFileId, AudioFileFormat format);
}