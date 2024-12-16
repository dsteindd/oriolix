using System.Runtime.Serialization;
using Microsoft.AspNetCore.Identity;

namespace WebApp.API.Models;

[DataContract]
public class ApplicationUser : IdentityUser<Guid>
{
    [ProtectedPersonalData]
    public string FirstName { get; set; } = null!;
    [ProtectedPersonalData]
    public string LastName { get; set; } = null!;
    [ProtectedPersonalData]
    public Address Address { get; set; } = null!;
    [ProtectedPersonalData]
    public bool ToSAccepted { get; set; }

    public string FullName => $"{FirstName} {LastName}";
}