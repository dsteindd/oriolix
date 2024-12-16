using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.API.Application.Annotations;
using WebApp.API.Application.Annotations.ChangeAnnotationConfidence;
using WebApp.API.Application.Annotations.CreateAnnotation;
using WebApp.API.Application.Annotations.DeleteAnnotation;
using WebApp.API.Application.Annotations.DownloadAnnotationsOfFileZip;
using WebApp.API.Application.Annotations.GetAnnotation;
using WebApp.API.Application.Annotations.GetFileAnnotators;
using WebApp.API.Application.Users.GetUsers;
using WebApp.API.Configuration;
using WebApp.API.Controllers.Models;
using WebApp.API.Implementations.Paging;
using WebApp.API.Infrastructure.Search;

namespace WebApp.API.Controllers;

[ApiController]
[Route("api")]
public class AnnotationController : ControllerBase
{
    private readonly IMediator _mediator;

    public AnnotationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("files/{fileId:guid}/annotations/download")]
    [Authorize()]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(NoContentResult), StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DownloadAnnotationsOfFile([FromRoute] Guid fileId, CancellationToken cancellationToken)
    {
        var zipResult = await _mediator.Send(new DownloadAnnotationsOfFileZipQuery(fileId), cancellationToken);

        if (zipResult == null)
        {
            return NoContent();
        }

        return File(zipResult.ZipStream, "application/octet-stream", zipResult.ZipName);
    }

    [HttpGet("files/{fileId:guid}/annotations/{annotationId:guid}")]
    [Authorize(Roles=Roles.Admin)]
    [ProducesResponseType(typeof(AnnotationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAnnotationById(
        [FromRoute] Guid fileId, 
        [FromRoute] Guid annotationId,
        CancellationToken cancellationToken
        )
    {
        var annotation = await _mediator.Send(new GetAnnotationQuery(annotationId, fileId), cancellationToken);

        return Ok(annotation);
    }

    [HttpPost("files/{fileId:guid}/annotations")]
    [Authorize]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status204NoContent)]
    public async Task<ActionResult<Identifier>> CreateAnnotation(
        [FromRoute] Guid fileId,
        [FromBody] AnnotationModel annotationModel,
        CancellationToken cancellationToken
        )
    {
        await _mediator.Send(new CreateAnnotationCommand(
            fileId,
            annotationModel.Points,
            annotationModel.PrimaryLabelId,
            annotationModel.SecondaryLabelId,
            5
        ), cancellationToken);

        return NoContent();
    }

    [HttpPatch("files/{fileId:guid}/annotations/{annotationId:guid}/confidence")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ChangeAnnotationConfidence(
        [FromRoute] Guid fileId,
        [FromRoute] Guid annotationId,
        [FromBody] ChangeAnnotationModel model,
        CancellationToken cancellationToken
    )
    {
        await _mediator.Send(new ChangeAnnotationConfidenceCommand(
            fileId,
            annotationId,
            model.Confidence
        ), cancellationToken);

        return NoContent();
    }
    
    [HttpDelete("files/{fileId}/annotations/{annotationId}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> DeleteAnnotation(
        [FromRoute] Guid fileId,
        [FromRoute] Guid annotationId, 
        CancellationToken cancellationToken
        )
    {
        await _mediator.Send(new DeleteAnnotationByIdCommand(annotationId, fileId), cancellationToken);

        return Ok();
    }

    [HttpGet("files/{fileId:guid}/annotations/-/annotators")]
    [Authorize(Roles = Roles.Admin)]
    [ProducesResponseType(typeof(List<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAnnotatorsOfFile(
        [FromRoute] Guid fileId,
        [FromQuery] SearchParameters searchParameters,
        [FromRoute] PageParameters pageParameters,
        CancellationToken cancellationToken
    )
    {
        var annotators = await _mediator.Send(
            new GetFileAnnotatorsQuery(fileId, searchParameters, pageParameters),
            cancellationToken);

        return Ok(annotators);
    }
}