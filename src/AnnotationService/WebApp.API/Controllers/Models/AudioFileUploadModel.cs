using Microsoft.AspNetCore.Mvc;

namespace WebApp.API.Controllers.Models;

public class AudioFileUploadModel
{
    [FromForm] public IFormFile File { get; set; } = null!;

    [FromForm] public double? Latitude { get; set; } = null;

    [FromForm] public double? Longitude { get; set; } = null;

    [FromForm] public DateTime? StartedOn { get; set; } = null;
}