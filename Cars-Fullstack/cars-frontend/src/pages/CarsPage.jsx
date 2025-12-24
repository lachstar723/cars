import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5089';

const VALID_MAKES = [
  'Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai',
  'Infiniti', 'Isuzu', 'Land Rover', 'Nissan', 'Porsche',
  'Renault', 'Tesla', 'Toyota', 'Volvo'
];

function CarsPage() {
  const [cars, setCars] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [loadingCars, setLoadingCars] = useState(false);
  const [carsError, setCarsError] = useState(null);

  const fetchCars = async () => {
    setLoadingCars(true);
    setCarsError(null);

    try {
      const url = selectedMake
        ? `${API_BASE_URL}/cars?make=${encodeURIComponent(selectedMake)}`
        : `${API_BASE_URL}/cars`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const data = await response.json();
      setCars(data);
    } catch (error) {
      setCarsError(error.message);
    } finally {
      setLoadingCars(false);
    }
  };

  return (
    <section className="section">
      <h2>Cars</h2>

      <div className="controls">
        <select
          value={selectedMake}
          onChange={(e) => setSelectedMake(e.target.value)}
          disabled={loadingCars}
        >
          <option value="">All Makes</option>
          {VALID_MAKES.map(make => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>

        <button onClick={fetchCars} disabled={loadingCars}>
          {loadingCars ? 'Loading...' : 'Search Cars'}
        </button>
      </div>

      {carsError && <div className="error">Error: {carsError}</div>}

      {cars.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Licence Plate</th>
              <th>Make</th>
              <th>Colour</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => (
              <tr key={index}>
                <td>{car.licencePlate}</td>
                <td>{car.make}</td>
                <td>{car.colour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loadingCars && <p className="no-data">No cars loaded. Click "Search Cars" to retrieve data.</p>
      )}
    </section>
  );
}

export default CarsPage;
