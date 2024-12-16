using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Application.Common;
using WebApp.API.Data;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Projects.GetProjectDetails;

public record GetProjectDetailsQuery(Guid ProjectId) : IRequest<ProjectDTO>;


public class GetProjectDetailsQueryHandler : IRequestHandler<GetProjectDetailsQuery, ProjectDTO>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUserContextAccessor _userContextAccessor;
    private readonly IAuthorizationChecker _authorizationChecker;

    public GetProjectDetailsQueryHandler(ApplicationDbContext context, IMapper mapper,
        IUserContextAccessor userContextAccessor, IAuthorizationChecker authorizationChecker)
    {
        _context = context;
        _mapper = mapper;
        _userContextAccessor = userContextAccessor;
        _authorizationChecker = authorizationChecker;
    }

    public async Task<ProjectDTO> Handle(GetProjectDetailsQuery request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new InvalidOperationException($"Project with id {request.ProjectId} not found");
        }

        if (!(await _authorizationChecker.May(AppActions.View, project, _userContextAccessor.UserId)))
        {
            throw new InvalidCommandException("Forbidden");
        }

        var dto = _mapper.Map<ProjectDTO>(project);

        dto.IsOwner = _userContextAccessor.IsAvailable && (_userContextAccessor.UserId == project.OwnerId);

        return dto;
    }
}