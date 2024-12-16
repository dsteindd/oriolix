using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Projects.GetProjects;

public record GetProjectsQuery : IRequest<List<ProjectDTO>>;


public class GetProjectsQueryHandler : IRequestHandler<GetProjectsQuery, List<ProjectDTO>>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUserContextAccessor _userContextAccessor;

    public GetProjectsQueryHandler(
        ApplicationDbContext context,
        IMapper mapper,
        IUserContextAccessor userContextAccessor
    )
    {
        _context = context;
        _mapper = mapper;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<List<ProjectDTO>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
    {
        if (_userContextAccessor.IsAvailable && _userContextAccessor.IsAdmin)
        {
            var projects = await _context.Projects.ToListAsync(cancellationToken);
            return _mapper.Map<List<ProjectDTO>>(projects);
        }

        if (_userContextAccessor.IsAvailable)
        {
            // return all the projects for which there is a member with the current user id
            var projects = await _context.Projects
                .Where(p => p.Members.Any(m => m.UserId == _userContextAccessor.UserId))
                .ToListAsync(cancellationToken);
            return _mapper.Map<List<ProjectDTO>>(projects, opt => 
                opt.AfterMap((source, destination) =>
                {
                    foreach (var dto in destination)
                    {
                        dto.IsOwner = dto.OwnerId == _userContextAccessor.UserId;
                    }
                }));
        }
        // create new forbid result
        throw new InvalidCommandException("Forbid");
    }
}