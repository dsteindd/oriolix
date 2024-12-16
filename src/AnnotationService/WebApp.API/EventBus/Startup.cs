using RabbitMQ.Client;
using WebApp.API.Application.Classification.IntegrationEvents;
using WebApp.API.Application.Files.IntegrationEvents;

namespace WebApp.API.EventBus;

public static class Startup
{
    public static IServiceCollection AddEventBus(this IServiceCollection services, IConfiguration configuration)
    {
        var settings = new RabbitMQSettings();
        configuration.Bind(nameof(RabbitMQSettings), settings);


        services.AddSingleton<IRabbitMQPersistentConnection>(sp =>
        {
            var logger = sp.GetRequiredService<ILogger<DefaultRabbitMQPersistentConnection>>();

            var factory = new ConnectionFactory()
            {
                HostName = settings.EventBusConnection,
                DispatchConsumersAsync = true,
                UserName = settings.EventBusUserName,
                Password = settings.EventBusPassword,
            };

            return new DefaultRabbitMQPersistentConnection(factory, logger, settings.EventBusRetryCount);
        });


        services.AddSingleton<IEventBus, EventBusRabbitMQ>(sp =>
        {
            var subscriptionClientName = settings.SubscriptionClientName;
            var rabbitMQPersistentConnection = sp.GetRequiredService<IRabbitMQPersistentConnection>();
            var iLifetimeScope = sp.GetRequiredService<IServiceProvider>();
            var logger = sp.GetRequiredService<ILogger<EventBusRabbitMQ>>();
            var eventBusSubcriptionsManager = sp.GetRequiredService<IEventBusSubscriptionsManager>();

            var retryCount = settings.EventBusRetryCount;

            return new EventBusRabbitMQ(
                rabbitMQPersistentConnection,
                logger, iLifetimeScope,
                eventBusSubcriptionsManager,
                subscriptionClientName, 
                retryCount
                );
        });
        
        services.AddSingleton<IEventBusSubscriptionsManager, InMemoryEventBusSubscriptionsManager>();
        
        return services;

    }

    public static IServiceCollection AddIntegrationEvents(this IServiceCollection services)
    {
        services.AddTransient<ClassificationFailedIntegrationEventHandler>();
        services.AddTransient<ClassificationDoneIntegrationEventHandler>();
        services.AddTransient<FilePreprocessedIntegrationEventHandler>();
        services.AddTransient<FilePreprocessingFailedIntegrationEventHandler>();

        return services;
    }

    public static IHost ConfigureEventBus(this IHost app)
    {
        var eventBus = app.Services.GetRequiredService<IEventBus>();
        
        eventBus.Subscribe<ClassificationDoneIntegrationEvent, ClassificationDoneIntegrationEventHandler>();
        eventBus.Subscribe<ClassificationFailedIntegrationEvent, ClassificationFailedIntegrationEventHandler>();
        eventBus.Subscribe<FilePreprocessedIntegrationEvent, FilePreprocessedIntegrationEventHandler>();
        eventBus.Subscribe<FilePreprocessingFailedIntegrationEvent, FilePreprocessingFailedIntegrationEventHandler>();

        return app;
    }
}