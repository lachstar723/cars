using carsAPI.Repositories;
using carsAPI.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddSingleton<ICarRepository, CarRepository>();
builder.Services.AddSingleton<ICarService, CarService>();
builder.Services.AddSingleton<IRegistrationJobQueue, RegistrationJobQueue>();

builder.Services.AddHostedService<RegistrationBackgroundService>();

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(builder.Configuration["ReactAppUrl"])
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapHub<carsAPI.RegistrationsHub>("/hubs/registrations");

app.MapGet("/cars", async (string? make, ICarService service) =>
{
    try
    {
        var cars = await service.GetCarsAsync(make);
        return Results.Ok(cars);
    }
    catch (NullReferenceException ex)
    {
        return Results.NotFound(ex.Message);
    }
    catch (FileNotFoundException ex)
    {
        return Results.NotFound(ex.Message);
    }
    catch (Exception ex)
    {
        return Results.InternalServerError(ex.Message);
    }
});


app.MapPost("/registrations", async (IRegistrationJobQueue queue) =>
{
    try
    {
        await queue.EnqueueAsync();
        return Results.Accepted();
    }
    catch (Exception ex)
    {
        return Results.InternalServerError(ex.Message);
    }
});
app.Run();