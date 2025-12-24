namespace carsAPI.Models;

public class Car
{
    public required string LicencePlate { get; set; }
    public required string Vin { get; set; }
    public required string Colour { get; set; }
    public required string Make { get; set; }
    public DateTimeOffset RegistrationValidFrom { get; set; }
    public DateTimeOffset RegistrationValidTo { get; set; }
}

public class CarSensitive
{
    public string LicencePlate { get; set; }
    public string Colour { get; set; }
    public string Make { get; set; }

    public CarSensitive(string licencePlate, string colour, string make)
    {
        LicencePlate = licencePlate;
        Colour = colour;
        Make = make;
    }
}

public class CarData
{
    public required List<Car> Cars { get; set; }
}

public class CarRegistration
{
    public string Vin { get; set; }
    public string LicencePlate { get; set; }
    public bool IsValid  { get; set; }

    public CarRegistration(string vin, string licencePlate, bool isValid)
    {
        Vin = vin;
        LicencePlate = licencePlate;
        IsValid = isValid;
    }
}