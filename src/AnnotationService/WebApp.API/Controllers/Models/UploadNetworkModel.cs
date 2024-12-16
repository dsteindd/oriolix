using Microsoft.AspNetCore.Mvc;

namespace WebApp.API.Controllers.Models;

public class UploadNetworkModel
{
    [FromForm]
    public IFormFile NetworkFile { get; set; }
    [FromForm]
    public IFormFile LabelFile { get; set; }
    [FromForm]
    public string Name { get; set; }
    [FromForm]
    public string Description { get; set; }
    [FromForm]
    public bool IsPublic { get; set; }

    [FromForm] 
    public int FrameDuration { get; set; } = 2;
    [FromForm]
    public int FrameOverlap { get; set; } = 1;

}