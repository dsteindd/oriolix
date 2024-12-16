using System.Text.Json.Serialization;

namespace WebApp.API.EventBus.Events;

public record IntegrationEvent
{        
    public IntegrationEvent()
    {
        Id = Guid.NewGuid();
    }

    [JsonConstructor]
    public IntegrationEvent(Guid id)
    {
        Id = id;
    }
    
    [JsonInclude]
    public Guid Id { get; private init; }

}
