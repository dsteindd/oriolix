using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.API.Application.LabelSets;
using WebApp.API.Application.LabelSets.CreateLabelSet;
using WebApp.API.Application.LabelSets.DeleteLabelSet;
using WebApp.API.Application.LabelSets.GetLabelSetDetails;
using WebApp.API.Application.LabelSets.GetLabelSets;
using WebApp.API.Application.LabelSets.GetProjectLabels;
using WebApp.API.Application.Projects;
using WebApp.API.Controllers.Models;

namespace WebApp.API.Controllers;

[ApiController]
[Route("api")]
public class LabelSetController : ControllerBase
{
    private readonly IMediator _mediator;

    public LabelSetController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("label-sets")]
    [Authorize]
    [ProducesResponseType(typeof(List<LabelSetDTO>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<LabelSetDTO>>> GetLabelSets(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetLabelSetsQuery(), cancellationToken));
    }

    [HttpGet("label-sets/{labelSetId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(List<LabelSetDTO>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<LabelSetDTO>>> GetLabelSet(
        [FromRoute] Guid labelSetId,
        CancellationToken cancellationToken
    )
    {
        return Ok(await _mediator.Send(new GetLabelSetDetailsQuery(labelSetId), cancellationToken));
    }

    [HttpGet("projects/{projectId:guid}/labels")]
    [Authorize]
    [ProducesResponseType(typeof(ProjectLabelsDTO), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProjectLabelsDTO>> GetLabelSetOfProject(
        [FromRoute] Guid projectId,
        CancellationToken cancellationToken
    )
    {
        return Ok(await _mediator.Send(new GetProjectLabelsQuery(projectId), cancellationToken));
    }

    [HttpPost("label-sets")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateLabelSet(
        [FromBody] AddLabelSetModel model,
        CancellationToken cancellationToken
    )
    {
        await _mediator.Send(new CreateLabelSetCommand(
            model.Name,
            model.Description,
            model.IsPublic,
            model.LabelNames,
            model.LabelAltNames
        ), cancellationToken);

        return Ok();
    }

    [HttpDelete("label-sets/{labelSetId:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteLabelSet(
        [FromRoute] Guid labelSetId,
        CancellationToken cancellationToken
    )
    {
        await _mediator.Send(new DeleteLabelSetCommand(labelSetId), cancellationToken);

        return NoContent();
    }
}