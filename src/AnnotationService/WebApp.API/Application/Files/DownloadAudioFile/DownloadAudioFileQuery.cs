using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models.AudioFiles;
using WebApp.API.Services;

namespace WebApp.API.Application.Files.DownloadAudioFile;

public record DownloadAudioFileQuery(
    Guid FileId,
    bool Denoise = false
) : IRequest<DownloadFileResult>;

public class DownloadAudioFileQueryHandler : IRequestHandler<DownloadAudioFileQuery, DownloadFileResult>
{
    private readonly IAudioFileStorage _audioFileStorage;
    private readonly ApplicationDbContext _context;


    public DownloadAudioFileQueryHandler(
        ApplicationDbContext context,
        IAudioFileStorage audioFileStorage
    )
    {
        _context = context;
        _audioFileStorage = audioFileStorage;
    }

    public async Task<DownloadFileResult> Handle(DownloadAudioFileQuery request, CancellationToken cancellationToken)
    {
        var file = await _context.AudioFiles
            .FirstOrDefaultAsync(f => f.Id == request.FileId,
                cancellationToken
            );

        if (file == null)
        {
            throw new InvalidCommandException($"File with id {request.FileId} not found");
        }

        var result = file.Download(request.Denoise, _audioFileStorage);

        return result;
    }
}