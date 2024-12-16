using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Projects.ShareProject;

public record ShareProjectCommand(Guid ProjectId, string Mail) : IRequest;


public class ShareProjectCommandHandler : IRequestHandler<ShareProjectCommand>
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContextAccessor _userContextAccessor;
    private readonly UserManager<ApplicationUser> _userManager;

    public ShareProjectCommandHandler(
        ApplicationDbContext context,
        IUserContextAccessor userContextAccessor,
        UserManager<ApplicationUser> userManager
    )
    {
        _context = context;
        _userContextAccessor = userContextAccessor;
        _userManager = userManager;
    }

    public async Task<Unit> Handle(ShareProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(
            p => p.Id == request.ProjectId,
            cancellationToken
        );

        if (project == null)
        {
            throw new InvalidCommandException($"Project with id {request.ProjectId} does not exist");
        }

        var user = await _userManager.FindByEmailAsync(request.Mail);

        project.AddMember(
            _userContextAccessor.UserId,
            user.Id,
            user.FullName
        );

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}