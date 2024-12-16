using MediatR;

namespace WebApp.API.Infrastructure.Mediation;

public class NonBlockingPublisher : Mediator
{
    public NonBlockingPublisher(ServiceFactory serviceFactory) : base(serviceFactory)
    {
    }

    protected override Task PublishCore(IEnumerable<Func<INotification, CancellationToken, Task>> allHandlers,
        INotification notification, CancellationToken cancellationToken)
    {
        foreach (var handler in allHandlers)
            Task.Run(() => handler(notification, cancellationToken), cancellationToken);

        return Task.CompletedTask;
    }
}