# cars
A minimal fullstack application, utilising .Net and React.


Start up:

- Download source code
- cd cars-frontend
- npm install
- npm run dev
- default port is 5173

- cd carsAPI/carsAPI
- dotnet run
- Default port is 5089


Cars API:

- .Net 10
- Web API - minimal APIs rather than controller based
- Background service utilised channel-based queing and Signal R for realtime communication via a PUB/SUB model with the Front end.
- Code architecture follows a Service/Repository design making it simple to extend further functionality. E.g. If we were to change this from using the car.json file to a DB, we would only need to play with the Repository layer.
- 2 Endpoints as per specification
- GET /cars
    - Takes an optoional query parameter to return results based on make
    - response is a JSON array of cars
- POST /registrations
    - Returns a list of cars and their registration status
    - chose POST rather than GET as even though we are retrieving data, we are creating a job for the server

Cars-Frontend:

- React 19.2
- Used vite to streamline the build of the APP
- React Router to handle the two Endpoints on separate pages
- '/' User can get data on all cars or filter cars based on their make
- '/registration' User can submit a request to get upto date registation on all cars
- Simple SignalR implementation with the addition of a heartbeat and reconnect capabilities with exponential backoff


