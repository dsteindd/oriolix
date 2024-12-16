using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.CodeAnalysis;
using WebApp.API.Contracts;
using WebApp.API.Models.AudioFiles;

namespace WebApp.API.Models.Projects.Rules;

public class FilesMustBeDeletedWhenProjectIsDeletedRule : IBusinessRule
{
    private readonly IEnumerable<Guid> _fileIds;
    private readonly IEnumerable<AudioFileFormat> _formats;
    private readonly IAudioFileStorage _audioFileStorage;
    private readonly Guid _projectId;
    private readonly List<Guid> _notDeletedFileIds;

    public FilesMustBeDeletedWhenProjectIsDeletedRule(
        Guid projectId,
        IEnumerable<Guid> fileId, 
        IEnumerable<AudioFileFormat> format, 
        IAudioFileStorage audioFileStorage)
    {
        _fileIds = fileId;
        _formats = format;
        _audioFileStorage = audioFileStorage;
        _projectId = projectId;
        _notDeletedFileIds = new List<Guid>();
    }

    public bool IsBroken
    {
        get
        {
            foreach (var (fileId, format) in _fileIds.Zip(_formats))
            {
                if (_audioFileStorage.DoesAudioFileExist(fileId, format))
                {
                    _notDeletedFileIds.Add(fileId);
                }
            }
            
            return _notDeletedFileIds.Any();
        }
    }
    public string Message => $"Could not delete audio files with ids {string.Join(", ", _notDeletedFileIds)} " +
        $"for project with id {_projectId}";
}