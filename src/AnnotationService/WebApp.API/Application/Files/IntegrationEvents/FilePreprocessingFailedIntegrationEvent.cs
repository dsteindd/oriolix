using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.EventBus.Abstractions;
using WebApp.API.EventBus.Events;
using WebApp.API.Models.AudioFiles;

namespace WebApp.API.Application.Files.IntegrationEvents;

public record FilePreprocessingFailedIntegrationEvent(Guid FileId) : IntegrationEvent;


public class FilePreprocessingFailedIntegrationEventHandler : IIntegrationEventHandler<FilePreprocessingFailedIntegrationEvent>
{
    private readonly ApplicationDbContext _context;
    private readonly IAudioFileStorage _audioFileStorage;

    public FilePreprocessingFailedIntegrationEventHandler(ApplicationDbContext context, IAudioFileStorage audioFileStorage)
    {
        _context = context;
        _audioFileStorage = audioFileStorage;
    }

    public async Task Handle(FilePreprocessingFailedIntegrationEvent @event)
    {
        var audioFile = await _context.AudioFiles.FirstOrDefaultAsync(
            f => f.Id == @event.FileId
        );

        if (audioFile != null)
        {
            audioFile.Delete(_audioFileStorage);
            _context.Remove(audioFile);
        }

        await _context.SaveChangesAsync();
    }
}