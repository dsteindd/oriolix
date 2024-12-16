using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;

namespace WebApp.API.Application.Projects.UnshareProject;

public record UnshareProjectCommand(Guid ProjectId, Guid UserId) : IRequest;

public class UnshareProjectCommandHandler : IRequestHandler<UnshareProjectCommand>
{
    private readonly ApplicationDbContext _context;

    public UnshareProjectCommandHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UnshareProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new InvalidCommandException($"Project with id {request.ProjectId} not found");
        }

        project.Unshare(request.UserId);

        await _context.SaveChangesAsync(cancellationToken);
        
        return Unit.Value;
    }
}
