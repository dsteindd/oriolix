using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApp.API.Configuration;
using WebApp.API.CsvModels;
using WebApp.API.Models;
using WebApp.API.Models.LabelSets;

namespace WebApp.API.Data.Seed;

public static class Seeder
{
    public static IHost SeedDatabase(this IHost app, IConfiguration configuration)
    {
        var adminConfiguration = new AdminConfiguration();
        configuration.Bind(nameof(AdminConfiguration), adminConfiguration);


        app.SeedRoles();
        app.SeedUsers(adminConfiguration);
        app.SeedDefaultLabelSets();

        return app;
    }

    private static void SeedDefaultLabelSets(this IHost app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (context.LabelSets.Include(ls => ls.Labels)
                    .SingleOrDefault(ls =>
                        ls.Name == LabelSetsSeed.BirdLabelSet.Name &&
                        ls.Description == LabelSetsSeed.BirdLabelSet.Description &&
                        ls.IsPublic &&
                        ls.CreatorId == null) is not { } labelSet)
            {
                labelSet = LabelSet.New(
                    LabelSetsSeed.BirdLabelSet.Name,
                    LabelSetsSeed.BirdLabelSet.Description,
                    true,
                    null
                );
                context.LabelSets.Add(labelSet);
            }

            var csvConfiguration = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                PrepareHeaderForMatch = args => args.Header.ToLower()
            };

            using (var reader = new StreamReader("./assets/species.csv"))
            using (var csv = new CsvReader(reader, csvConfiguration))
            {
                var records = csv.GetRecords<CsvBirdModel>();

                foreach (var record in records)
                {
                    var labelName = $"{record.Family} {record.Species}";
                    var labelAltName = $"{record.CommonName}";

                    if (labelSet.Labels.FirstOrDefault(l => l.Name == labelName) is not { } _)
                    {
                        labelSet.AddLabel(labelName, labelAltName);
                    }
                }
            }

            if (context.LabelSets.Include(ls => ls.Labels)
                    .SingleOrDefault(ls =>
                        ls.Name == LabelSetsSeed.SoundTypeLabelSet.Name &&
                        ls.Description == LabelSetsSeed.SoundTypeLabelSet.Description &&
                        ls.IsPublic &&
                        ls.CreatorId == null) is not { } soundTypeLabelSet)
            {
                soundTypeLabelSet = LabelSet.New(
                    LabelSetsSeed.SoundTypeLabelSet.Name,
                    LabelSetsSeed.SoundTypeLabelSet.Description,
                    true,
                    null
                );
                context.LabelSets.Add(soundTypeLabelSet);
            }

            foreach (var type in LabelSetsSeed.SoundTypeLabelSet.Labels)
            {
                if (soundTypeLabelSet.Labels.SingleOrDefault(l => l.Name == type.Name) is not { } _)
                {
                    soundTypeLabelSet.AddLabel(type.Name, type.AltName);
                }
            }


            context.SaveChanges();
        }
    }

    private static void SeedUsers(this IHost app, AdminConfiguration adminConfiguration)
    {
        using (var scope = app.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            if (string.IsNullOrEmpty(adminConfiguration.Mail) || string.IsNullOrEmpty(adminConfiguration.Password))
                throw new ArgumentException("No Admin User or Password specified!");

            var adminAppUser = userManager.FindByEmailAsync(adminConfiguration.Mail).GetAwaiter().GetResult();

            if (adminAppUser == null)
            {
                adminAppUser = new ApplicationUser
                {
                    Email = adminConfiguration.Mail,
                    UserName = adminConfiguration.Mail,
                    FirstName = "admin",
                    LastName = "admin",
                    Address = Address.NewAddress(
                        "admin",
                        null,
                        "admin",
                        "admin"
                    )
                };
                var result = userManager.CreateAsync(adminAppUser, adminConfiguration.Password).GetAwaiter()
                    .GetResult();

                if (!result.Succeeded)
                    throw new InvalidOperationException(
                        "Something went wrong creating the admin user. Errors " +
                        $"{string.Join(',', result.Errors.Select(e => e.Code))}");

                var code = userManager.GenerateEmailConfirmationTokenAsync(adminAppUser).GetAwaiter().GetResult();
                var confirmResult = userManager.ConfirmEmailAsync(adminAppUser, code).GetAwaiter().GetResult();

                if (!confirmResult.Succeeded)
                    throw new InvalidOperationException(
                        "Something went wrong auto confirming the admin user mail. Errors " +
                        $"{string.Join(',', confirmResult.Errors.Select(e => e.Code))}");
            }

            if (!userManager.IsInRoleAsync(adminAppUser, Roles.Admin).GetAwaiter().GetResult())
            {
                var roleAssignmentResult =
                    userManager.AddToRoleAsync(adminAppUser, Roles.Admin).GetAwaiter().GetResult();

                if (!roleAssignmentResult.Succeeded)
                    throw new InvalidOperationException(
                        "Something went wrong assigning the admin user to the admin role");
            }
        }
    }

    private static void SeedRoles(this IHost app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

            if (!roleManager.RoleExistsAsync(Roles.User).GetAwaiter().GetResult())
                roleManager.CreateAsync(new ApplicationRole { Name = Roles.User })
                    .GetAwaiter().GetResult();

            if (!roleManager.RoleExistsAsync(Roles.Admin).GetAwaiter().GetResult())
                roleManager.CreateAsync(new ApplicationRole { Name = Roles.Admin })
                    .GetAwaiter().GetResult();
        }
    }
    //
    // private static void SeedNetworkModels(this IHost app)
    // {
    //     using (var scope = app.Services.CreateScope())
    //     {
    //         var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    //         var storage = scope.ServiceProvider.GetRequiredService<INetworkModelStorage>();
    //
    //         foreach (var networkData in NetworkModelSeed.Dates)
    //         {
    //             var network = context.NetworkModels.FirstOrDefault(nm => nm.Name == networkData.Name);
    //             if (network == null)
    //             {
    //                 var modelStream = new MemoryStream();
    //                 using (var modelReader = File.OpenRead(networkData.LoadModelPath))
    //                 {
    //                     modelReader.CopyTo(modelStream);
    //                 }
    //
    //                 modelStream.Seek(0, SeekOrigin.Begin);
    //
    //                 var labelStream = new MemoryStream();
    //                 using (var labelFileReader = File.OpenRead(networkData.LoadLabelPath))
    //                 {
    //                     labelFileReader.CopyTo(labelStream);
    //                 }
    //
    //                 labelStream.Seek(0, SeekOrigin.Begin);
    //
    //                 network = NetworkModel.New(
    //                     networkData.Format,
    //                     networkData.Name,
    //                     networkData.Description,
    //                     networkData.FrameDuration,
    //                     networkData.FrameOverlap,
    //                     storage,
    //                     modelStream,
    //                     labelStream,
    //                     networkData.IsPublic,
    //                     networkData.CreatorId
    //                 );
    //
    //
    //                 context.NetworkModels.Add(network);
    //             }
    //             else if (network.Description != networkData.Description ||
    //                      network.IsPublic != networkData.IsPublic ||
    //                      network.CreatorId != networkData.CreatorId)
    //             {
    //                 network.Edit(
    //                     networkData.Name,
    //                     networkData.Description,
    //                     networkData.IsPublic
    //                 );
    //             }
    //
    //             // read label file and add labels
    //             var index = 0;
    //             foreach (var label in File.ReadLines(networkData.LoadLabelPath))
    //             {
    //                 if (!network.HasLabel(index, label))
    //                 {
    //                     network.SetLabel(index, label);
    //                 }
    //
    //                 index++;
    //             }
    //
    //             context.SaveChanges();
    //         }
    //     }
    // }
}