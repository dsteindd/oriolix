using System.Net;
using System.Net.Mail;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace WebApp.API.Infrastructure.Mails;

public static class StartupExtensions
{
    public static IServiceCollection AddMailSender(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment
    )
    {
        var smtpSettings = new SmtpSettings();
        configuration.Bind(nameof(SmtpSettings), smtpSettings);

        if (string.IsNullOrEmpty(smtpSettings.FromEmail))
            throw new InvalidOperationException("Please configure a FromEmail to use email verification");

        SmtpClient smtpClient;


        if (smtpSettings.DeliveryMethod == SmtpDeliveryMethod.SpecifiedPickupDirectory)
        {
            if (smtpSettings.PickupDirectoryLocation == null)
                throw new InvalidOperationException(
                    "SMTP Pickup Directory needs to be defined for the delivery method " +
                    $"{smtpSettings.DeliveryMethod}");

            var directory = Path.Combine(
                environment.ContentRootPath,
                smtpSettings.PickupDirectoryLocation
            );

            if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);

            smtpClient = new SmtpClient
            {
                Host = smtpSettings.Host,
                PickupDirectoryLocation = directory,
                DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory,
                EnableSsl = false
            };
        }
        else if (smtpSettings.DeliveryMethod == SmtpDeliveryMethod.Network)
        {
            if (smtpSettings.Credentials == null)
                throw new InvalidOperationException(
                    $"Credentials must be set to use delivery method {smtpSettings.DeliveryMethod}");


            smtpClient = new SmtpClient
            {
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Host = smtpSettings.Host,
                Credentials =
                    new NetworkCredential(smtpSettings.Credentials.UserName, smtpSettings.Credentials.Password),
                Port = smtpSettings.Port,
                EnableSsl = true
            };
        }
        else
        {
            throw new NotSupportedException($"Delivery method {smtpSettings.DeliveryMethod} is not supported");
        }


        services
            .AddFluentEmail(smtpSettings.FromEmail, smtpSettings.FromName ?? smtpSettings.FromEmail)
            .AddSmtpSender(smtpClient);

        services.AddScoped<IEmailSender, SmtpEmailSender>();

        return services;
    }
}