using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApp.API.Application.Annotations;
using WebApp.API.Application.Annotations.DownloadAnnotationsOfFileZip;
using WebApp.API.Application.Annotations.DownloadAnnotationsZip;
using WebApp.API.Application.Annotations.GetFileAnnotations;
using WebApp.API.Application.Files.CreateAudioFile;
using WebApp.API.Application.Files.GetAudioFileDetails;
using WebApp.API.Application.Files.GetAudioFiles;
using WebApp.API.Application.Projects;
using WebApp.API.Application.Projects.CreateProject;
using WebApp.API.Application.Projects.DeleteProject;
using WebApp.API.Application.Projects.EditProject;
using WebApp.API.Application.Projects.GetProjectDetails;
using WebApp.API.Application.Projects.GetProjects;
using WebApp.API.Application.Projects.GetProjectShareDetails;
using WebApp.API.Application.Projects.ShareProject;
using WebApp.API.Application.Projects.UnshareProject;
using WebApp.API.Controllers.Models;

namespace WebApp.API.Controllers;

[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProjectsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{projectId:guid}/files")]
    [Authorize]
    [ProducesResponseType(typeof(List<AudioFileDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AudioFileDto>>> GetUserAudioFiles(
        [FromRoute] Guid projectId,
        CancellationToken cancellationToken
    )
    {
        return Ok(await _mediator.Send(new GetAudioFilesQuery(projectId), cancellationToken));
    }

    [HttpGet("{projectId:guid}/files/{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(AudioFileDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AudioFileDto>> GetAudioFile(
        [FromRoute] Guid projectId,
        [FromRoute] Guid id,
        CancellationToken cancellationToken
    )
    {
        return Ok(await _mediator.Send(
            new GetAudioFileDetailsQuery(projectId, id),
            cancellationToken
        ));
    }

    [HttpGet("{projectId:guid}/files/{id:guid}/annotations/download")]
    [Authorize]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(NoContentResult), StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DownloadUserAnnotationsOfFile(
        [FromRoute] Guid id,
        CancellationToken cancellationToken
    )
    {
        var zipResult = await _mediator.Send(new DownloadAnnotationsOfFileZipQuery(id), cancellationToken);

        if (zipResult == null)
        {
            return NoContent();
        }

        return File(zipResult.ZipStream, "application/octet-stream", zipResult.ZipName);
    }

    [HttpGet("{projectId:guid}/annotations/download")]
    [Authorize]
    [ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(NoContentResult), StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DownloadProjectFileAnnotations(
        [FromRoute] Guid projectId,
        CancellationToken cancellationToken
    )
    {
        var zipResult = await _mediator.Send(new DownloadAnnotationsOfProjectZipQuery(projectId), cancellationToken);

        if (zipResult == null)
        {
            return NoContent();
        }

        return File(zipResult.ZipStream, "application/octet-stream", zipResult.ZipName);
    }

    [HttpGet("{projectId:guid}/files/{fileId:guid}/annotations")]
    [Authorize]
    [ProducesResponseType(typeof(List<AnnotationDto>), StatusCodes.Status200OK)]
    [Produces("application/json")]
    public async Task<ActionResult<List<AnnotationDto>>> GetAuthenticatedFileAnnotations(
        [FromRoute] Guid projectId,
        [FromRoute] Guid fileId,
        CancellationToken cancellationToken
    )
    {
        var annotations = await _mediator.Send(
            new GetFileAnnotationsQuery(projectId, fileId), cancellationToken);

        return Ok(annotations);
    }

    [HttpGet()]
    [Authorize]
    [ProducesResponseType(typeof(List<ProjectDTO>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProjectDTO>>> GetProjects(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetProjectsQuery(), cancellationToken);

        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(CreatedAtActionResult), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateNewProject(
        [FromBody] ProjectModel projectModel,
        CancellationToken cancellationToken
    )
    {
        var projectId = await _mediator.Send(new CreateProjectCommand(
            projectModel.Name,
            projectModel.Description,
            projectModel.PrimaryLabelSetId,
            projectModel.SecondaryLabelSetId
        ), cancellationToken);

        return CreatedAtAction(nameof(GetProject), new { projectId = projectId });
    }

    [HttpPut("{projectId:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> EditProject(
        [FromRoute] Guid projectId,
        [FromBody] ProjectModel projectModel,
        CancellationToken cancellationToken
    )
    {
        await _mediator.Send(new EditProjectCommand(
            projectId,
            projectModel.Name,
            projectModel.Description,
            projectModel.PrimaryLabelSetId,
            projectModel.SecondaryLabelSetId
        ), cancellationToken);

        return NoContent();
    }

    [HttpPatch("{projectId:guid}/share")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ShareProject(
        [FromRoute] Guid projectId,
        [FromBody] ShareProjectModel shareModel,
        CancellationToken cancellationToken
    )
    {
        await _mediator.Send(new ShareProjectCommand(projectId, shareModel.Mail), cancellationToken);
        return NoContent();
    }

    [HttpPatch("{projectId:guid}/unshare")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UnshareProject(
        [FromRoute] Guid projectId,
        [FromBody] UnshareProjectModel unshareModel,
        CancellationToken cancellationToken
    )
    {
        await _mediator.Send(new UnshareProjectCommand(projectId, unshareModel.UserId), cancellationToken);
        return NoContent();
    }

    [HttpGet("{projectId:guid}/shares")]
    [Authorize]
    [ProducesResponseType(typeof(List<ProjectShareDetailsDTO>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProjectShareDetailsDTO>>> GetProjectShareDetails(
        [FromRoute] Guid projectId,
        CancellationToken cancellationToken
    )
    {
        return Ok(await _mediator.Send(new GetProjectShareDetailsQuery(projectId), cancellationToken));
    }

    [HttpDelete("{projectId:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteProject(
        [FromRoute] Guid projectId,
        CancellationToken cancellationToken
    )
    {
        await _mediator.Send(new DeleteProjectCommand(projectId), cancellationToken);

        return NoContent();
    }

    [HttpGet("{projectId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ProjectDTO), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProject(
        [FromRoute] Guid projectId,
        CancellationToken cancellationToken
    )
    {
        return Ok(await _mediator.Send(new GetProjectDetailsQuery(projectId), cancellationToken));
    }


    [HttpPost("{projectId:guid}/files")]
    [Authorize]
    [DisableRequestSizeLimit]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Upload(
        [FromForm] AudioFileUploadModel uploadModel,
        CancellationToken cancellationToken,
        [FromRoute] Guid? projectId = null
    )
    {
        await _mediator.Send(new CreateAudioFileRequest(
            projectId,
            uploadModel.File,
            uploadModel.Latitude,
            uploadModel.Longitude,
            uploadModel.StartedOn
        ), cancellationToken);

        return NoContent();
    }
}