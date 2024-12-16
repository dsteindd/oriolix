using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WebApp.API.Data;
using WebApp.API.Infrastructure.Identity.Authentication;
using WebApp.API.Models;

namespace WebApp.API.Infrastructure.Identity;

public static class StartupExtensions
{
    public static IServiceCollection AddIdentityAndIdentityServer(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        var identityServerConfiguration = new IdentityServerConfiguration();
        configuration.Bind(nameof(IdentityServerConfiguration), identityServerConfiguration);

        services.AddIdentity<ApplicationUser, ApplicationRole>(
                options =>
                {
                    options.SignIn.RequireConfirmedAccount = true;

                    var passwordOptions = new PasswordOptions()
                    {
                        RequiredLength = 6,
                        RequiredUniqueChars = 4,
                        RequireLowercase = true,
                        RequireUppercase = true,
                        RequireDigit = true,
                        RequireNonAlphanumeric = false

                    };
                    options.Password = passwordOptions;
                })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders()
            .AddUserStore<UserStore<ApplicationUser, ApplicationRole, ApplicationDbContext, Guid>>()
            .AddRoleStore<RoleStore<ApplicationRole, ApplicationDbContext, Guid>>()
            .AddDefaultUI();

        var is4Certificate = new X509Certificate2(File.ReadAllBytes("./certs/identity-server-cert.pfx"),
            identityServerConfiguration.CertPassword);

        services.AddIdentityServer()
            .AddApiAuthorization<ApplicationUser, ApplicationDbContext>(options =>
            {
                options.SigningCredential = new X509SigningCredentials(is4Certificate);
            })
            .AddProfileService<ProfileService>();

        services.AddAuthentication()
            .AddIdentityServerJwt();


        return services;
    }
}