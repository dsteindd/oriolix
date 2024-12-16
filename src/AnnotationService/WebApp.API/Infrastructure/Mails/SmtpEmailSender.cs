using FluentEmail.Core;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace WebApp.API.Infrastructure.Mails;

/// <summary>
///     Sends E-Mails as a client of a server, e.g. GMX or TU Mail server
/// </summary>
public class SmtpEmailSender : IEmailSender
{
    private readonly IFluentEmail _email;

    public SmtpEmailSender(IFluentEmail email)
    {
        _email = email;
    }

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var mail = _email
            .To(email)
            .Subject(subject)
            .Body(htmlMessage, true);
        await mail.SendAsync();

        // throw new NotImplementedException();
    }
}