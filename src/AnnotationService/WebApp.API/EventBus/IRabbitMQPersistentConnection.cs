using RabbitMQ.Client;

namespace WebApp.API.EventBus;

public interface IRabbitMQPersistentConnection : IDisposable
{
    bool IsConnected { get; }
    bool TryConnect();
    IModel CreateModel();
}