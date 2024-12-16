using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.EventBus.Abstractions;
using WebApp.API.EventBus.Events;
using WebApp.API.EventBus.Extensions;

namespace WebApp.API.Application.Classification.IntegrationEvents;

public record ClassificationFailedIntegrationEvent(Guid NetworkId, Guid FileId, string Error) : IntegrationEvent;

public class ClassificationFailedIntegrationEventHandler :
    IIntegrationEventHandler<ClassificationFailedIntegrationEvent>
{
    private readonly ApplicationDbContext _context;

    public ClassificationFailedIntegrationEventHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(ClassificationFailedIntegrationEvent @event)
    {
        var report = await _context.ClassificationReports
            .FirstOrDefaultAsync(cp => cp.ClassifierId == @event.NetworkId && cp.FileId == @event.FileId);

        if (report == null)
        {
            throw new InvalidCommandException($"Report for network with id {@event.NetworkId} " +
                                              $"and file {@event.FileId} not found");
        }

        _context.ClassificationReports.Remove(report);

        await _context.SaveChangesAsync();
    }
}