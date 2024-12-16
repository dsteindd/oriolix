
using WebApp.API.EventBus.Events;

namespace WebApp.API.Application.Classification.IntegrationEvents;

public record ClassificationRequestedIntegrationEvent(
    Guid NetworkId, string NetworkFileName, Guid AudioFileId, string AudioFileName, int FrameDuration=2, int FrameOverlap=1
    ) : IntegrationEvent;