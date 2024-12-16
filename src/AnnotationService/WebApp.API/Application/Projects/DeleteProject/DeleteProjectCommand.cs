using MediatR;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models.AudioFiles;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Projects.DeleteProject;

public record DeleteProjectCommand(Guid ProjectId) : IRequest;


public class DeleteProjectCommandHandler : IRequestHandler<DeleteProjectCommand>
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContextAccessor _userContextAccessor;
    private readonly IAudioFileStorage _storage;

    public DeleteProjectCommandHandler(ApplicationDbContext context, IUserContextAccessor userContextAccessor,
        IAudioFileStorage storage)
    {
        _context = context;
        _userContextAccessor = userContextAccessor;
        _storage = storage;
    }

    public async Task<Unit> Handle(DeleteProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Files)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new InvalidCommandException($"Project with id {request.ProjectId} not found");
        }

        project.Delete(_userContextAccessor.UserId, _storage);

        _context.AudioFiles.RemoveRange(project.Files);

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
