using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Application.Projects;
using WebApp.API.Data;

namespace WebApp.API.Application.LabelSets.GetProjectLabels;

public record GetProjectLabelsQuery(Guid ProjectId) : IRequest<ProjectLabelsDTO>;


public class GetProjectLabelsQueryHandler : IRequestHandler<GetProjectLabelsQuery, ProjectLabelsDTO>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    
    public GetProjectLabelsQueryHandler(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ProjectLabelsDTO> Handle(GetProjectLabelsQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.PrimaryLabelSet)
            .ThenInclude(ls => ls.Labels)
            .Include(p => p.SecondaryLabelSet)
            .ThenInclude(ls => ls.Labels)
            .SingleOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new InvalidCommandException($"Project with id {request.ProjectId} not found");
        }

        var labelSetDTO = _mapper.Map<ProjectLabelsDTO>(project);

        return labelSetDTO;

    }
}