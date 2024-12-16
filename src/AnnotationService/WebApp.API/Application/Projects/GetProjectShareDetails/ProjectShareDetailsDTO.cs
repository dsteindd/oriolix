namespace WebApp.API.Application.Projects.GetProjectShareDetails;

public class ProjectShareDetailsDTO
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = null!;
    public string Email { get; set; } = null!;
}