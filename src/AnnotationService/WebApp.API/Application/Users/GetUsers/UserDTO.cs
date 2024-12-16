namespace WebApp.API.Application.Users.GetUsers;

public class UserDto
{
    public Guid Id { get; set; }
    public string Mail { get; set; } = null!;
    public string FullName { get; set; }
    public List<string> Roles { get; set; }
}