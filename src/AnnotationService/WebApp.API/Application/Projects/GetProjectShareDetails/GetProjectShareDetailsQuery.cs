using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Application.Common;
using WebApp.API.Data;
using WebApp.API.Models;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Projects.GetProjectShareDetails;

public record GetProjectShareDetailsQuery(Guid ProjectId) : IRequest<List<ProjectShareDetailsDTO>>;

public class GetProjectShareDetailsQueryHandler : IRequestHandler<GetProjectShareDetailsQuery, List<ProjectShareDetailsDTO>>
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContextAccessor _userContextAccessor;
    private readonly IAuthorizationChecker _authorizationChecker;
    private readonly UserManager<ApplicationUser> _userManager;



    public GetProjectShareDetailsQueryHandler(
        ApplicationDbContext context, 
        IUserContextAccessor userContextAccessor,
        IAuthorizationChecker authorizationChecker, 
        UserManager<ApplicationUser> userManager
        )
    {
        _context = context;
        _userContextAccessor = userContextAccessor;
        _authorizationChecker = authorizationChecker;
        _userManager = userManager;
    }

    public async Task<List<ProjectShareDetailsDTO>> Handle(
        GetProjectShareDetailsQuery request, 
        CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
        {
            throw new InvalidCommandException($"Project with id {request.ProjectId} not found");
        }
        
        if (!(await _authorizationChecker.May(AppActions.ViewShares, project, _userContextAccessor.UserId)))
        {
            throw new InvalidCommandException("Forbidden");
        }

        var shareInfos = await project.Members
            .ToAsyncEnumerable()
            .Where(m => m.UserId != _userContextAccessor.UserId)
            .SelectAwait(async (m) =>
            {
                var mail = await GetMail(m.UserId);

                return new ProjectShareDetailsDTO()
                {
                    UserId = m.UserId,
                    UserName = m.UserName,
                    Email = mail
                };
            })
            .ToListAsync(cancellationToken);

        return shareInfos;
    }

    private async Task<string> GetMail(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        return user.Email;
    }
}