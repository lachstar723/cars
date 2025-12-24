namespace carsAPI.Services;
public interface IRegistrationJobQueue
{
    ValueTask EnqueueAsync();
    ValueTask DequeueAsync(CancellationToken cancellationToken);
}