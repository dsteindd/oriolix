using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;

namespace WebApp.API.Application.Files.GetAudioFiles;

public record GetAudioFilesQuery(Guid ProjectId) : IRequest<List<AudioFileDto>>;

public class GetAudioFilesQueryHandler : IRequestHandler<GetAudioFilesQuery, List<AudioFileDto>>
{
    private readonly IMapper _mapper;
    private readonly ApplicationDbContext _context;

    public GetAudioFilesQueryHandler(IMapper mapper, ApplicationDbContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<List<AudioFileDto>> Handle(GetAudioFilesQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Files)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new InvalidCommandException($"Project with id {request.ProjectId} not found");
        }

        return _mapper.Map<List<AudioFileDto>>(project.Files);
    }
}
