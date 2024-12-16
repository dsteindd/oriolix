using Microsoft.AspNetCore.Mvc;

namespace WebApp.API.Controllers.Models;

public class EditNetworkModel
{
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsPublic { get; set; }
    public int InputImageWidth { get; set; } = 384;
    public int InputImageHeight { get; set; } = 128;
    public bool IsGrayscale { get; set; } = true;
}