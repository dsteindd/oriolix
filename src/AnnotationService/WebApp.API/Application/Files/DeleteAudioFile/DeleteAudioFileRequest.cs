using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models.AudioFiles;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Files.DeleteAudioFile;

public record DeleteAudioFileRequest(Guid FileId) : IRequest;


public class DeleteAudioFileRequestHandler : IRequestHandler<DeleteAudioFileRequest>
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContextAccessor _userContext;
    private readonly IAudioFileStorage _audioFileStorage;

    public DeleteAudioFileRequestHandler(
        IUserContextAccessor userContext,
        IAudioFileStorage audioFileStorage,
        ApplicationDbContext context
    )
    {
        _userContext = userContext;
        _audioFileStorage = audioFileStorage;
        _context = context;
    }

    public async Task<Unit> Handle(DeleteAudioFileRequest request, CancellationToken cancellationToken)
    {
        var file = await _context.AudioFiles.FirstOrDefaultAsync(
            f => f.Id == request.FileId,
            cancellationToken
        );

        if (file == null)
        {
            throw new InvalidCommandException($"File with id {request.FileId} not found");
        }

        file.Delete(_audioFileStorage);

        _context.AudioFiles.Remove(file);

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}