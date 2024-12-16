using WebApp.API.Data;
using WebApp.API.EventBus.Abstractions;
using WebApp.API.EventBus.Events;

namespace WebApp.API.Application.Classification.IntegrationEvents;

public record ClassificationDoneIntegrationEvent(Guid NetworkId, Guid FileId, List<Classification> Report) : 
IntegrationEvent;

public record Classification(string Label, double Confidence, int FromTime, int ToTime);

public class ClassificationDoneIntegrationEventHandler 
    : IIntegrationEventHandler<ClassificationDoneIntegrationEvent>
{

    private readonly ApplicationDbContext _context;

    public ClassificationDoneIntegrationEventHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(ClassificationDoneIntegrationEvent @event)
    {
        var report = _context.ClassificationReports
            .FirstOrDefault(cr => cr.ClassifierId == @event.NetworkId && cr.FileId == @event.FileId);

        if (report == null)
        {
            throw new InvalidCommandException($"Report for network with id {@event.NetworkId} " +
                                              $"and file {@event.FileId} not found");
        }
        
        foreach (var c in @event.Report)
        {
            report.AddClassification(c.FromTime, c.ToTime, c.Confidence, c.Label);
        }
        
        report.MarkDone();
        await _context.SaveChangesAsync();
    }
}