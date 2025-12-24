using carsAPI.Models;

namespace carsAPI.Services;

public interface ICarService
{
    Task<IEnumerable<CarSensitive>> GetCarsAsync(string? make);
    Task<IEnumerable<CarRegistration>> GetCarRegistrationsAsync();
}