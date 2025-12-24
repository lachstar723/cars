using System.Threading.Channels;

namespace carsAPI.Services;

public class RegistrationJobQueue : IRegistrationJobQueue
{
    private readonly Channel<bool> _queue = Channel.CreateUnbounded<bool>();

    public async ValueTask EnqueueAsync()
    {
        await _queue.Writer.WriteAsync(true);
    }

    public async ValueTask DequeueAsync(CancellationToken cancellationToken)
    {
        await _queue.Reader.ReadAsync(cancellationToken);
    }
}