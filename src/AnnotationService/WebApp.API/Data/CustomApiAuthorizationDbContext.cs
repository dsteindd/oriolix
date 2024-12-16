using IdentityServer4.EntityFramework.Entities;
using IdentityServer4.EntityFramework.Extensions;
using IdentityServer4.EntityFramework.Interfaces;
using IdentityServer4.EntityFramework.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using WebApp.API.Common;
using WebApp.API.UserContext;

namespace WebApp.API.Data;

public class CustomApiAuthorizationDbContext<TUser, TRole, TKey> :
    IdentityDbContext<TUser, TRole, TKey>,
    IPersistedGrantDbContext
    where TUser : IdentityUser<TKey>
    where TRole : IdentityRole<TKey>
    where TKey : IEquatable<TKey>
{
    private readonly IOptions<OperationalStoreOptions> _operationalStoreOptions;
    private readonly IUserContextAccessor _userContextAccessor;

    public CustomApiAuthorizationDbContext(
        DbContextOptions options,
        IOptions<OperationalStoreOptions> operationalStoreOptions, 
        IUserContextAccessor userContextAccessor)
        : base(options)
    {
        _operationalStoreOptions = operationalStoreOptions;
        _userContextAccessor = userContextAccessor;
    }

    // public Task<int> SaveChangesAsync()
    // {
    //     return SaveChangesAsync(new CancellationToken());
    // }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        HandleAuditingBeforeSaveChanges(_userContextAccessor.HasUserId ? _userContextAccessor.UserId : Guid.Empty);

        int result = await base.SaveChangesAsync(cancellationToken);

        return result;
    }
    
    private void HandleAuditingBeforeSaveChanges(Guid userId)
    {
        foreach (var entry in ChangeTracker.Entries<IAuditableEntity>().ToList())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedBy = userId;
                    entry.Entity.LastModifiedBy = userId;
                    break;

                case EntityState.Modified:
                    entry.Entity.LastModifiedOn = DateTime.UtcNow;
                    entry.Entity.LastModifiedBy = userId;
                    break;

                case EntityState.Deleted:
                    // if (entry.Entity is ISoftDelete softDelete)
                    // {
                    //     softDelete.DeletedBy = userId;
                    //     softDelete.DeletedOn = DateTime.UtcNow;
                    //     entry.State = EntityState.Modified;
                    // }

                    break;
            }
        }

        ChangeTracker.DetectChanges();
    }

    public async Task<int> SaveChangesAsync()
    {
        return await SaveChangesAsync(new CancellationToken());
    }

    public DbSet<PersistedGrant> PersistedGrants { get; set; } = null!;
    public DbSet<DeviceFlowCodes> DeviceFlowCodes { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ConfigurePersistedGrantContext(_operationalStoreOptions.Value);
    }
}