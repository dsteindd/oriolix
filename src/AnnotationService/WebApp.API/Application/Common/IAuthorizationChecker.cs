
using WebApp.API.Models.AudioFiles;
using WebApp.API.Models.Projects;

namespace WebApp.API.Application.Common;

public interface IAuthorizationChecker
{
    Task<bool> May(string action, Project project, Guid userId);
    Task<bool> May(string action, AudioFile audioFile, Guid userId);
}