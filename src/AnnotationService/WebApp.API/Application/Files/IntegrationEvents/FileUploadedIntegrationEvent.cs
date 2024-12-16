
using WebApp.API.EventBus.Events;

namespace WebApp.API.Application.Files.IntegrationEvents;

public record FileUploadedIntegrationEvent(
    Guid FileId, 
    string FileName,
    string SpecFileName,
    string DenoiseFileName,
    string SpecDenoiseFileName
) : IntegrationEvent;
    
    