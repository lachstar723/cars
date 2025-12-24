using System.Text.Json;
using carsAPI.Models;

namespace carsAPI.Repositories;

public class CarRepository : ICarRepository
{
    private readonly Lazy<Task<List<Car>>> _cars;

    public CarRepository()
    {
        _cars = new Lazy<Task<List<Car>>>(LoadCarsAsync);
    }
    
    private async Task<List<Car>> LoadCarsAsync()
    {
        var filePath = Path.Combine(AppContext.BaseDirectory, "data", "cars.json");
        
        if (!File.Exists(filePath))
            throw new FileNotFoundException($"File {filePath} not found");

        var json = await File.ReadAllTextAsync(filePath);

        var jsonOpts = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var carData = JsonSerializer.Deserialize<CarData>(json, jsonOpts);

        if (carData != null)
            return carData.Cars;
        
        throw new NullReferenceException("No Car data found!.");
    }
    
    public async Task<IReadOnlyList<Car>> GetCarsAsync() => await _cars.Value;
}