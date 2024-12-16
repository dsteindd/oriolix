using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.API.Application.Files.DeleteAudioFile;
using WebApp.API.Application.Files.DownloadAudioFile;
using WebApp.API.Application.Files.GetSpectrogramImage;
using WebApp.API.Controllers.Models;

namespace WebApp.API.Controllers;

[ApiController]
[Route("api")]
public class AudioFileController : ControllerBase
{
    private readonly IMediator _mediator;

    public AudioFileController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("files/{id:guid}/spectrogram/image")]
    [Authorize()]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSpectrogramImageOfAudioFile(
        [FromRoute] Guid id,
        [FromQuery] SpectrogramQueryFilter filter,
        CancellationToken cancellationToken
    )
    {
        var fileStream = await _mediator.Send(new GetSpectrogramImageQuery(
                id,
                filter.Denoise,
                filter.MinTime,
                filter.MaxTime,
                filter.MinFrequency,
                filter.MaxFrequency),
            cancellationToken
        );

        return File(fileStream, "image/png");
    }

    [HttpDelete("files/{id:guid}")]
    [Authorize()]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteAudioFile(
        [FromRoute] Guid id,
        CancellationToken cancellationToken
    )
    {
        await _mediator.Send(new DeleteAudioFileRequest(id));

        return NoContent();
    }

    [HttpGet("files/{id:guid}/download")]
    [Authorize()]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> DownloadAudioFile(
        [FromRoute] Guid id,
        CancellationToken cancellationToken,
        [FromQuery] bool denoise = false
    )
    {
        var download = await _mediator.Send(new DownloadAudioFileQuery(id, denoise), cancellationToken);

        return File(download.Content, download.ContentType, download.FileName, true);
    }
}