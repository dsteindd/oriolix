using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models.Projects;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Projects.CreateProject;

public record CreateProjectCommand(
    string Name,
    string? Description,
    Guid PrimaryLabelSetId,
    Guid? SecondaryLabelSetId
) : IRequest<Guid>;


public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContextAccessor _userContextAccessor;
    
    public CreateProjectCommandHandler(ApplicationDbContext context, IUserContextAccessor userContextAccessor)
    {
        _context = context;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(
            u => u.Id == _userContextAccessor.UserId,
            cancellationToken
        );

        if (user == null)
        {
            throw new Exception();
        }

        var project = Project.New(
            _userContextAccessor.UserId,
            user.FullName,
            request.Name,
            request.Description
        );
        project.SetPrimaryLabelSet(request.PrimaryLabelSetId);

        if (request.SecondaryLabelSetId.HasValue)
        {
            project.SetSecondaryLabelSet(request.SecondaryLabelSetId.Value);
        }

        await _context.Projects.AddAsync(project, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return project.Id;
    }
}