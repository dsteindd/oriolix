using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Application.Common;
using WebApp.API.Application.Files.IntegrationEvents;
using WebApp.API.Data;
using WebApp.API.EventBus;
using WebApp.API.Models.AudioFiles;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Files.CreateAudioFile;

public record CreateAudioFileRequest(
    Guid? ProjectId,
    IFormFile Content,
    double? Latitude = null,
    double? Longitude = null,
    DateTime? StartedOn = null
) : IRequest;


public class CreateAudioFileRequestHandler : IRequestHandler<CreateAudioFileRequest>
{
    private readonly IUserContextAccessor _contextAccessor;
    private readonly IEventBus _eventBus;
    private readonly ApplicationDbContext _context;
    private readonly IAuthorizationChecker _authorizationChecker;
    private readonly IAudioFileStorage _audioFileStorage;

    private readonly IVirusScanner _virusScanner;

    public CreateAudioFileRequestHandler(
        IUserContextAccessor contextAccessor,
        IVirusScanner virusScanner,
        IEventBus eventBus, 
        ApplicationDbContext context,
        IAuthorizationChecker authorizationChecker, 
        IAudioFileStorage audioFileStorage
        )
    {
        _contextAccessor = contextAccessor;
        _virusScanner = virusScanner;
        _eventBus = eventBus;
        _context = context;
        _authorizationChecker = authorizationChecker;
        _audioFileStorage = audioFileStorage;
    }

    public async Task<Unit> Handle(CreateAudioFileRequest request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new InvalidCommandException($"Project with id {request.ProjectId} not found");
        }
        
        if (!(await _authorizationChecker.May(AppActions.Upload, project, _contextAccessor.UserId)))
        {
            throw new InvalidCommandException("Forbid");
        }
        
        var ms = new MemoryStream();
        await request.Content.CopyToAsync(ms, cancellationToken);

        var scanResult = await _virusScanner.ScanFile(ms, cancellationToken);

        if (!scanResult.Ok) throw new InvalidCommandException(new List<string> { scanResult.Message! });

        var audioFile = AudioFile.CreateNew(
            _contextAccessor.UserId,
            request.ProjectId,
            request.Content.FileName,
            request.Content.OpenReadStream(),
            _audioFileStorage,
            request.Latitude,
            request.Longitude,
            request.StartedOn
        );
        await _context.AudioFiles.AddAsync(audioFile, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
        
        _eventBus.Publish(new FileUploadedIntegrationEvent(
            audioFile.Id,
            _audioFileStorage.GetAudioFileUri(audioFile.Id, audioFile.Format),
            _audioFileStorage.GetSpectrogramUri(audioFile.Id),
            _audioFileStorage.GetDenoisedAudioFileUri(audioFile.Id, audioFile.Format),
            _audioFileStorage.GetDenoisedSpectrogramUri(audioFile.Id)
        ));

        return Unit.Value;
    }
}