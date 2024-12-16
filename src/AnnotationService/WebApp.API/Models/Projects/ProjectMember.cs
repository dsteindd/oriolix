namespace WebApp.API.Models.Projects;

public class ProjectMember
{
    public Guid ProjectId { get; }
    public Guid UserId { get; }
    public string UserName { get; }
    
    public ProjectRole Role { get; }

    private ProjectMember()
    {
        // Only EF
    }
    
    private ProjectMember(
        Guid projectId,
        Guid userId,
        string userName,
        ProjectRole role
    )
    {
        ProjectId = projectId;
        UserId = userId;
        Role = role;
        UserName = userName;
    }
    
    internal static ProjectMember CreateNew(Guid projectId, Guid userId, string userName, ProjectRole role)
    {
        return new ProjectMember(projectId, userId, userName, role);
    }
    
}