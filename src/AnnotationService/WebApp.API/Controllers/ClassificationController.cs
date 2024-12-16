using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.API.Application.Classification;
using WebApp.API.Application.Classification.ClassifyFile;
using WebApp.API.Application.Classification.ClassifyOnline;
using WebApp.API.Application.Classification.DeleteNetwork;
using WebApp.API.Application.Classification.EditNetworkModel;
using WebApp.API.Application.Classification.GetClassificationReport;
using WebApp.API.Application.Classification.GetNetworkModel;
using WebApp.API.Application.Classification.GetNetworkModels;
using WebApp.API.Application.Classification.UploadModel;
using WebApp.API.Controllers.Models;
using WebApp.API.Models.Classification;

namespace WebApp.API.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
public class ClassificationController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClassificationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("classify-online")]
    [Authorize]
    [RequestSizeLimit(536870912)]
    [ProducesResponseType(typeof(ClassificationReportDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ClassifyOnline(
        [FromForm] OnlineClassificationModel model,
        CancellationToken cancellationToken
    )
    {
        var report = await _mediator.Send(
            new ClassifyOnlineCommand(
                model.NetworkModelId,
                model.AudioFile.OpenReadStream()
            ),
            cancellationToken
        );

        return Ok(report);
    }

    [HttpPost("classify-file")]
    [Authorize]
    [ProducesResponseType(typeof(ClassificationReportDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ClassifyFile(
        [FromBody] FileClassificationModel model,
        CancellationToken cancellationToken
    )
    {
        var report = await _mediator.Send(
            new ClassifyFileCommand(model.FileId, model.NetworkModelId),
            cancellationToken
        );

        return Ok(report);
    }

    [HttpGet("classifications/{reportId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ClassificationReport), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClassificationReport(
        [FromRoute] Guid reportId,
        CancellationToken cancellationToken
    )
    {
        var report = await _mediator.Send(new GetClassificationReportQuery(reportId), cancellationToken);

        return Ok(report);
    }

    [HttpGet("classifiers")]
    [Authorize]
    [ProducesResponseType(typeof(List<NetworkModelDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNetworkModels(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetNetworkModelsQuery(), cancellationToken));
    }

    [HttpGet("classifiers/{modelId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(NetworkModelDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<NetworkModelDto>> GetNetworkModel(
        [FromRoute] Guid modelId,
        CancellationToken cancellationToken
    )
    {
        return Ok(await _mediator.Send(new GetNetworkModelQuery(modelId), cancellationToken));
    }

    [HttpDelete("classifiers/{modelId:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult<NetworkModelDto>> DeleteNetworkModel(
        [FromRoute] Guid modelId,
        CancellationToken cancellationToken
    )
    {
        await _mediator.Send(new DeleteNetworkCommand(modelId), cancellationToken);

        return NoContent();
    }

    [HttpPost("classifiers")]
    [ProducesResponseType(typeof(IdResult), StatusCodes.Status201Created)]
    [DisableRequestSizeLimit]
    [Authorize]
    public async Task<ActionResult<IdResult>> UploadModel(
        [FromForm] UploadNetworkModel uploadNetworkModel,
        CancellationToken cancellationToken)
    {
        var id = await _mediator.Send(new UploadModelCommand(
            uploadNetworkModel.Name,
            uploadNetworkModel.Description,
            uploadNetworkModel.IsPublic,
            uploadNetworkModel.NetworkFile,
            uploadNetworkModel.LabelFile,
            uploadNetworkModel.FrameDuration,
            uploadNetworkModel.FrameOverlap
        ), cancellationToken);
        return CreatedAtAction(nameof(GetNetworkModel), new { modelId = id }, new IdResult()
        {
            Id = id
        });
    }

    [HttpPut("classifiers/{modelId:guid}/edit")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [Authorize]
    public async Task<IActionResult> EditModel(
        [FromRoute] Guid modelId,
        [FromBody] EditNetworkModel editNetworkModel,
        CancellationToken cancellationToken
    )
    {
        await _mediator.Send(new EditNetworkModelCommand(
            modelId,
            editNetworkModel.Name,
            editNetworkModel.Description,
            editNetworkModel.IsPublic
        ), cancellationToken);

        return NoContent();
    }
}