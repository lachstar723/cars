using carsAPI.Models;
using carsAPI.Repositories;

namespace carsAPI.Services;

public class CarService : ICarService
{
    private readonly ICarRepository _repo;

    public CarService(ICarRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<CarSensitive>> GetCarsAsync(string? make)
    {
        var cars = await _repo.GetCarsAsync();
        var carsSensitive = cars.Select(car => new CarSensitive(car.LicencePlate, car.Colour, car.Make)).ToList();

        return !string.IsNullOrWhiteSpace(make) ? carsSensitive.Where(car => car.Make == make).ToList() : carsSensitive;
    }

    public async Task<IEnumerable<CarRegistration>> GetCarRegistrationsAsync()
    {
        var cars = await _repo.GetCarsAsync();
        var now = DateTime.UtcNow;

        return cars.Select(car =>
            new CarRegistration(
                car.Vin,
                car.LicencePlate,
                now >= car.RegistrationValidFrom &&
                now <= car.RegistrationValidTo
            )).ToList();
    }
}