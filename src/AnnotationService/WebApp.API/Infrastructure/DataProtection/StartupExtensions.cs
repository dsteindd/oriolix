using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;

namespace WebApp.API.Infrastructure.DataProtection;

public static class StartupExtensions
{
    public static IServiceCollection AddDataProtection(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        var dataProtectionConfiguration = new DataProtectionConfiguration();
        configuration.Bind(nameof(DataProtectionConfiguration), dataProtectionConfiguration);


        services.AddDataProtection()
            .SetApplicationName("Annotation Service")
            .PersistKeysToFileSystem(new DirectoryInfo("./temp-keys/"))
            .UseCryptographicAlgorithms(new AuthenticatedEncryptorConfiguration
            {
                EncryptionAlgorithm = EncryptionAlgorithm.AES_256_CBC,
                ValidationAlgorithm = ValidationAlgorithm.HMACSHA256
            })
            .ProtectKeysWithCertificate(new X509Certificate2("./certs/data-protection-cert.pfx",
                dataProtectionConfiguration.CertPassword));

        return services;
    }
}