namespace WebApp.API.Models.Projects;

public record ProjectRole(string Value)
{
    public static ProjectRole Owner => new ProjectRole(nameof(Owner));
    public static ProjectRole Member => new ProjectRole(nameof(Member));
};