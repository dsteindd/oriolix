using MediatR;
using Microsoft.AspNetCore.Identity;
using WebApp.API.Configuration;
using WebApp.API.Models;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Users.ChangeAdminRole;

public record ChangeAdminRoleCommand(Guid UserId, bool ShouldBeAdmin) : IRequest;

public class ChangeAdminRoleCommandHandler : IRequestHandler<ChangeAdminRoleCommand>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUserContextAccessor _userContextAccessor;


    public ChangeAdminRoleCommandHandler(UserManager<ApplicationUser> userManager, IUserContextAccessor userContextAccessor)
    {
        _userManager = userManager;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<Unit> Handle(ChangeAdminRoleCommand request, CancellationToken cancellationToken)
    {
        if (_userContextAccessor.UserId == request.UserId)
        {
            return Unit.Value;
        }
        
        
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());

        if (user == null)
        {
            throw new InvalidCommandException($"User with id {request.UserId} not found");
        }
        

        if (request.ShouldBeAdmin && !(await _userManager.IsInRoleAsync(user, Roles.Admin)))
        {
            await _userManager.AddToRoleAsync(user, Roles.Admin);
        }

        if (!request.ShouldBeAdmin && await _userManager.IsInRoleAsync(user, Roles.Admin))
        {
            await _userManager.RemoveFromRoleAsync(user, Roles.Admin);
        }
        
        return Unit.Value;
    }
}