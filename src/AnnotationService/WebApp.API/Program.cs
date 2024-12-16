using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using Hellang.Middleware.ProblemDetails;
using Microsoft.AspNetCore.HttpOverrides;
using Serilog;
using WebApp.API.Application;
using WebApp.API.Application.Common;
using WebApp.API.Contracts;
using WebApp.API.Data;
using WebApp.API.Data.Seed;
using WebApp.API.EventBus;
using WebApp.API.Infrastructure;
using WebApp.API.Infrastructure.AudioFileStorage;
using WebApp.API.Infrastructure.Controllers;
using WebApp.API.Infrastructure.ExceptionMiddleware.ProblemDetails;
using WebApp.API.Infrastructure.NetworkModelStorage;
using WebApp.API.Models.AudioFiles;
using WebApp.API.Models.Classification;
using WebApp.API.Settings;
using WebApp.API.UserContext;

CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;


var builder = WebApplication.CreateBuilder(args);

var host = builder.Host;
host.UseSerilog((_, logger) =>
{
    logger.ReadFrom
        .Configuration(builder.Configuration);
});
builder.Services.AddScoped<INetworkModelStorage, FileSystemNetworkModelStorage>();

builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
builder.Services.AddDistributedMemoryCache();
builder.Services.ConfigureNonBreakingSameSiteCookies();

builder.Services.AddRazorPages();
builder.Services.AddSwaggerGen();


builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContextAccessor, UserContextAccessor>();
builder.Services.AddScoped<IAuthorizationChecker, AuthorizationChecker>();
builder.Services.AddScoped<IAudioFileStorage, FileSystemAudioFileStorage>();

builder.Services
    .AddProblemDetails(x =>
    {
        x.Map<BusinessRuleValidationException>(ex => new BusinessRuleValidationExceptionProblemDetails(ex));
        x.Map<InvalidCommandException>(ex => new InvalidCommandExceptionProblemDetails(ex));
    });

var settings = new OperatorSettings();
builder.Configuration.Bind(nameof(OperatorSettings), settings);
builder.Services.AddSingleton(settings);

var app = builder.Build();
app.Migrate<ApplicationDbContext>();
app.SeedDatabase(builder.Configuration);
app.ConfigureEventBus();
RegisterRequestPipeline(app);
app.Run();


void RegisterRequestPipeline(WebApplication app)
{
    var forwardedHeaderOptions = new ForwardedHeadersOptions()
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
        RequireHeaderSymmetry = false,
    };
    forwardedHeaderOptions.KnownNetworks.Clear();
    forwardedHeaderOptions.KnownProxies.Clear();

    app.UseForwardedHeaders(forwardedHeaderOptions);

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseMigrationsEndPoint();
        app.UseSwagger();
        app.UseSwaggerUI();
    }
    else
    {
        // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
        app.UseHsts();
    }

    app.UseProblemDetails();


    app.UseStaticFiles();
    app.UseCookiePolicy();
    app.UseRouting();

    JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

    app.UseAuthentication();
    app.UseIdentityServer();
    app.UseAuthorization();

    app.MapControllerRoute(
        "default",
        "{controller}/{action=Index}/{id?}");
    app.MapRazorPages();

    app.MapFallbackToFile("index.html");
}