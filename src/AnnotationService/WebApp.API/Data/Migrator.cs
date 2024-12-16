using Microsoft.EntityFrameworkCore;

namespace WebApp.API.Data;

public static class Migrator
{
    public static void Migrate<TContext>(this IHost app) where TContext : DbContext
    {
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<TContext>();
            db.Database.Migrate();
        }
    }
}