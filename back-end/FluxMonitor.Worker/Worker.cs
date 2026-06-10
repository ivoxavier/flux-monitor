namespace FluxMonitor.Worker;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceProvider _serviceProvider;

    public Worker(ILogger<Worker> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);

        
            using (var scope = _serviceProvider.CreateScope())
            {
                
                // var dbContext = scope.ServiceProvider.GetRequiredService<FluxMonitorDbContext>();
                
                // await dbContext.ProcessPendingEdiFilesAsync(stoppingToken);
            }

            
            await Task.Delay(15000, stoppingToken);
        }
    }
}