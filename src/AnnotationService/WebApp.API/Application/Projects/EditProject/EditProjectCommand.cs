using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Application.Common;
using WebApp.API.Data;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Projects.EditProject;

public record EditProjectCommand(
    Guid ProjectId,
    string Name,
    string? Description,
    Guid? PrimaryLabelSetId,
    Guid? SecondaryLabelSetId
) : IRequest;


public class EditProjectCommandHandler : IRequestHandler<EditProjectCommand>
{
    private readonly ApplicationDbContext _context;
    private readonly IAuthorizationChecker _authorizationChecker;
    private readonly IUserContextAccessor _userContextAccessor;


    public EditProjectCommandHandler(
        ApplicationDbContext context, 
        IAuthorizationChecker authorizationChecker, 
        IUserContextAccessor userContextAccessor
    )
    {
        _context = context;
        _authorizationChecker = authorizationChecker;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<Unit> Handle(EditProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new InvalidCommandException($"Project with id {request.ProjectId} not found");
        }

        if (!(await _authorizationChecker.May(AppActions.Edit, project, _userContextAccessor.UserId)))
        {
            throw new InvalidCommandException("You are not allowed to edit the project");
        }
        
        project.EditProject(
            _userContextAccessor.UserId, 
            request.Name, 
            request.Description,
            request.PrimaryLabelSetId, 
            request.SecondaryLabelSetId);

        await _context.SaveChangesAsync(cancellationToken);
        
        return Unit.Value;

    }
}