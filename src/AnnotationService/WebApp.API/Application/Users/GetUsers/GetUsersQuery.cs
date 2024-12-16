using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Models;
using WebApp.API.UserContext;

namespace WebApp.API.Application.Users.GetUsers;

public record GetUsersQuery : IRequest<List<UserDto>>;


public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUserContextAccessor _userContextAccessor;

    public GetUsersQueryHandler(UserManager<ApplicationUser> userManager, IUserContextAccessor userContextAccessor)
    {
        _userManager = userManager;
        _userContextAccessor = userContextAccessor;
    }

    public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userManager
            .Users
            .Where(u => u.Id != _userContextAccessor.UserId)
            .ToList()
            .ToAsyncEnumerable()
            .SelectAwait(async (u) => new UserDto()
            {
                Id = u.Id,
                Mail = u.Email,
                FullName = u.FullName,
                Roles = (await _userManager.GetRolesAsync(u)).ToList()
            })
            .ToListAsync(cancellationToken);
        
        return users;
    }
}