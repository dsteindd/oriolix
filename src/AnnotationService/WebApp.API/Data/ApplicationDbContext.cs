using IdentityServer4.EntityFramework.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using WebApp.API.Data.Constants;
using WebApp.API.Models;
using WebApp.API.Models.AudioFiles;
using WebApp.API.Models.Classification;
using WebApp.API.Models.LabelSets;
using WebApp.API.Models.Projects;
using WebApp.API.UserContext;

namespace WebApp.API.Data;

public class ApplicationDbContext : CustomApiAuthorizationDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        IOptions<OperationalStoreOptions> operationalStoreOptions,
        IUserContextAccessor userContextAccessor
        )
        : base(options, operationalStoreOptions, userContextAccessor)
    {
    }
    
    public DbSet<AudioFile> AudioFiles { get; set; } = null!;

    public DbSet<NetworkModel> NetworkModels { get; set; } = null!;

    public DbSet<ClassificationReport> ClassificationReports { get; set; } = null!;

    public DbSet<Project> Projects { get; set; } = null!;
    
    public DbSet<LabelSet> LabelSets { get; set; }
    public DbSet<Label> Labels { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<ApplicationUser>().ToTable(TableNames.Users);
        builder.Entity<ApplicationRole>().ToTable(TableNames.Roles);
        builder.Entity<IdentityUserLogin<Guid>>().ToTable(TableNames.UserLogins);
        builder.Entity<IdentityUserToken<Guid>>().ToTable(TableNames.UserTokens);
        builder.Entity<IdentityUserClaim<Guid>>().ToTable(TableNames.UserClaims);
        builder.Entity<IdentityUserRole<Guid>>().ToTable(TableNames.UserRoles);
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable(TableNames.RoleClaims);
        builder.ApplyConfigurationsFromAssembly(typeof(Program).Assembly);
    }
}