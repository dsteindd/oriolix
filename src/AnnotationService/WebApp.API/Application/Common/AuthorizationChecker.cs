using Microsoft.EntityFrameworkCore;
using WebApp.API.Data;
using WebApp.API.Models.AudioFiles;
using WebApp.API.Models.Projects;

namespace WebApp.API.Application.Common;

public class AuthorizationChecker : IAuthorizationChecker
{
    private readonly ApplicationDbContext _context;

    public AuthorizationChecker(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> May(string action, Project project, Guid userId)
    {
        return action switch
        {
            AppActions.Delete => project.OwnerId == userId,
            AppActions.Edit => project.OwnerId == userId,
            AppActions.Upload => project.Members.Any(m => m.UserId == userId),
            AppActions.View => project.Members.Any(m => m.UserId == userId),
            AppActions.Share => project.OwnerId == userId,
            AppActions.ViewShares => project.OwnerId == userId,
            _ => false
        };
    }

    public async Task<bool> May(string action, AudioFile audioFile, Guid userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == audioFile.ProjectId);

        if (project == null)
        {
            return false;
        }

        return await May(action, project, userId);
    }
}