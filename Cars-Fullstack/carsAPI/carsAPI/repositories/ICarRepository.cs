using carsAPI.Models;

namespace carsAPI.Repositories;

public interface ICarRepository
{
    Task<IReadOnlyList<Car>> GetCarsAsync();
}