using MediatR;
using Microsoft.AspNetCore.Identity;
using WebApp.API.Application.Users.GetUsers;
using WebApp.API.Models;

namespace WebApp.API.Application.Users.GetUserById;

public record GetUserByIdQuery(Guid Id) : IRequest<UserDto>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDto>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public GetUserByIdQueryHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.Id.ToString());

        if (user == null) throw new Exception($"User with id {request.Id} does not exist");

        return new UserDto
        {
            Id = user.Id,
            Mail = user.Email
        };
    }
}