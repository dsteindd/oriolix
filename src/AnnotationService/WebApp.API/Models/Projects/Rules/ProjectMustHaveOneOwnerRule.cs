using AutoMapper.Internal;
using WebApp.API.Contracts;

namespace WebApp.API.Models.Projects.Rules;

public class ProjectMustHaveOneOwnerRule : IBusinessRule
{
    private readonly IEnumerable<ProjectMember> _members;

    public ProjectMustHaveOneOwnerRule(IEnumerable<ProjectMember> members)
    {
        _members = members;
    }

    public bool IsBroken => _members.All(m => m.Role != ProjectRole.Owner);
    public string Message => $"Project must have at least one owner";
}