using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.API.Application.Users.ChangeAdminRole;
using WebApp.API.Application.Users.GetUserById;
using WebApp.API.Application.Users.GetUsers;
using WebApp.API.Configuration;
using WebApp.API.Controllers.Models;

namespace WebApp.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = Roles.Admin)]
[Produces("application/json")]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;

    public UserController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<List<UserDto>> GetUsers(CancellationToken cancellationToken)
    {
        return await _mediator.Send(new GetUsersQuery(), cancellationToken);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var user = await _mediator.Send(new GetUserByIdQuery(id), cancellationToken);

        return Ok(user);
    }

    [HttpPatch("{id:guid}/roles")]
    public async Task<ActionResult> ChangeAdminRoles(
        [FromRoute] Guid id,
        [FromBody] ChangeUserRolesModel changeUserRolesModel,
        CancellationToken cancellationToken
    )
    {
        await _mediator.Send(new ChangeAdminRoleCommand(id, changeUserRolesModel.ShouldBeAdmin), cancellationToken);

        return NoContent();
    }
}