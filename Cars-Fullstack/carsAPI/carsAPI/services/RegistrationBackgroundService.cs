using Microsoft.AspNetCore.SignalR;

namespace carsAPI.Services;

public class RegistrationBackgroundService : BackgroundService
{
    private readonly IRegistrationJobQueue _queue;
    private readonly ICarService _carService;
    private readonly IHubContext<RegistrationsHub> _hubContext;

    public RegistrationBackgroundService(
        IRegistrationJobQueue queue,
        ICarService carService,
        IHubContext<RegistrationsHub> hubContext)
    {
        _queue = queue;
        _carService = carService;
        _hubContext = hubContext;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await _queue.DequeueAsync(stoppingToken);
            
            var delay = Random.Shared.Next(5000, 10000);
            await Task.Delay(delay, stoppingToken);

            var results = await _carService.GetCarRegistrationsAsync();

            await _hubContext.Clients.All.SendAsync("RegistrationsCompleted", results, stoppingToken);
        }
    }
        
}