namespace WebApp.API.Controllers.Models;

public class OnlineClassificationModel
{
    public Guid NetworkModelId { get; set; }
    public IFormFile AudioFile { get; set; }
}