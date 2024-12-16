using WebApp.API.Contracts;

namespace WebApp.API.Models.AudioFiles.Rules;

public class FileMustExistAfterCreationRule : IBusinessRule
{
    private readonly Guid _fileId;
    private readonly AudioFileFormat _format;
    private readonly IAudioFileStorage _audioFileStorage;

    public FileMustExistAfterCreationRule(Guid fileId, AudioFileFormat format, IAudioFileStorage audioFileStorage)
    {
        _fileId = fileId;
        _format = format;
        _audioFileStorage = audioFileStorage;
    }

    public bool IsBroken => !_audioFileStorage.DoesAudioFileExist(_fileId, _format);
    public string Message => $"Audio file with id {_fileId} could not be saved";
}