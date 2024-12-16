using IdentityServer4.Events;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.EventBus.Abstractions;
using WebApp.API.EventBus.Events;

namespace WebApp.API.Application.Files.IntegrationEvents;

public record FilePreprocessedIntegrationEvent(
    Guid FileId,
    double DurationSeconds,
    int SampleRate
) : IntegrationEvent;

public class FilePreprocessedIntegrationEventHandler : IIntegrationEventHandler<FilePreprocessedIntegrationEvent>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FilePreprocessedIntegrationEventHandler> _logger;

    public FilePreprocessedIntegrationEventHandler(ApplicationDbContext context,
        ILogger<FilePreprocessedIntegrationEventHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task Handle(FilePreprocessedIntegrationEvent @event)
    {
        var file = await _context.AudioFiles.FirstOrDefaultAsync(af => af.Id == @event.FileId);

        if (file == null)
        {
            throw new InvalidCommandException($"File with id {@event.FileId} not found");
        }

        file.FinishPreProcessing((float)@event.DurationSeconds, @event.SampleRate);

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "File with id {FileId} preprocessed. Duration = {Duration}. SampleRate={SampleRate}",
            @event.FileId,
            @event.DurationSeconds,
            @event.SampleRate
        );
    }
}