using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Application.Files.GetAudioFiles;
using WebApp.API.Data;

namespace WebApp.API.Application.Files.GetAudioFileDetails;

public record GetAudioFileDetailsQuery(Guid ProjectId, Guid FileId) : IRequest<AudioFileDto>;

public class GetAudioFileDetailsQueryHandler : IRequestHandler<GetAudioFileDetailsQuery, AudioFileDto>
{
    private readonly IMapper _mapper;
    private readonly ApplicationDbContext _context;

    public GetAudioFileDetailsQueryHandler(
        IMapper mapper,
        ApplicationDbContext context
    )
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<AudioFileDto> Handle(GetAudioFileDetailsQuery request, CancellationToken cancellationToken)
    {
        var audioFile = await _context.AudioFiles.FirstOrDefaultAsync(
            f => f.Id == request.FileId,
            cancellationToken
        );

        if (audioFile == null)
        {
            throw new InvalidCommandException($"File with id {request.FileId} does not exist");
        }

        return _mapper.Map<AudioFileDto>(audioFile);
    }
}