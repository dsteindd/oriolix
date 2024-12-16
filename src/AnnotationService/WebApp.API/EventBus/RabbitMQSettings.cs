namespace WebApp.API.EventBus;

public class RabbitMQSettings
{
    public string EventBusConnection { get; set; }
    public string EventBusUserName { get; set; }
    public string EventBusPassword { get; set; }
    public int EventBusRetryCount { get; set; }
    public string SubscriptionClientName { get; set; }
}