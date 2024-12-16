using System.Net.Mail;

namespace WebApp.API.Infrastructure.Mails;

public class SmtpSettings
{
    public SmtpDeliveryMethod DeliveryMethod { get; set; }
    public string PickupDirectoryLocation { get; set; } = "/mails";

    public string FromEmail { get; set; } = "support@oriolix.com";
    public string? FromName { get; set; } = "Oriolix";
    public string Host { get; set; } = null!;
    public int Port { get; set; } = 587;

    public Credentials? Credentials { get; set; } = null;
}

public class Credentials
{
    public string UserName { get; set; } = null!;
    public string Password { get; set; } = null!;
}