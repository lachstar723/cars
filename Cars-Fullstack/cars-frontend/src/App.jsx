import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import CarsPage from './pages/CarsPage';
import RegistrationPage from './pages/RegistrationPage';
import './App.css';

const API_BASE_URL = 'http://localhost:5089';

const RECONNECT_DELAYS = [1000, 3000, 5000, 10000, 30000];
const MAX_RECONNECT_DELAY = 30000;
const HEARTBEAT_INTERVAL = 5000;

function Navigation() {
  const location = useLocation();

  return (
    <nav className="nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        Cars
      </Link>
      <Link to="/registration" className={location.pathname === '/registration' ? 'active' : ''}>
        Registration Status
      </Link>
    </nav>
  );
}

function AppContent() {
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [registrationsError, setRegistrationsError] = useState(null);
  const [signalRConnected, setSignalRConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const connectionRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const isConnectingRef = useRef(false);

  const startHeartbeat = () => {
    stopHeartbeat();

    heartbeatIntervalRef.current = setInterval(() => {
      const connection = connectionRef.current;

      if (!connection) {
        setSignalRConnected(false);
        setConnectionStatus('disconnected');
        return;
      }

      if (connection.state === signalR.HubConnectionState.Connected) {
        setSignalRConnected(true);
        setConnectionStatus('connected');
      } else {
        setSignalRConnected(false);
        if (connection.state === signalR.HubConnectionState.Reconnecting) {
          setConnectionStatus('reconnecting');
        } else {
          setConnectionStatus('disconnected');
          attemptReconnect();
        }
      }
    }, HEARTBEAT_INTERVAL);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const attemptReconnect = () => {
    if (isConnectingRef.current) {
      return;
    }

    const connection = connectionRef.current;
    if (!connection) {
      return;
    }

    if (connection.state === signalR.HubConnectionState.Connected ||
        connection.state === signalR.HubConnectionState.Connecting) {
      return;
    }

    clearReconnectTimeout();

    const delayIndex = Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1);
    const delay = reconnectAttemptRef.current < RECONNECT_DELAYS.length
      ? RECONNECT_DELAYS[delayIndex]
      : MAX_RECONNECT_DELAY;

    setConnectionStatus('reconnecting');
    isConnectingRef.current = true;

    reconnectTimeoutRef.current = setTimeout(async () => {
      try {
        await connection.start();
        setSignalRConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptRef.current = 0;
        startHeartbeat();
        isConnectingRef.current = false;
      } catch (err) {
        setSignalRConnected(false);
        reconnectAttemptRef.current++;
        isConnectingRef.current = false;
        attemptReconnect();
      }
    }, delay);
  };

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/registrations`, {
        withCredentials: true,
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on('RegistrationsCompleted', (data) => {
      setRegistrations(data);
      setLoadingRegistrations(false);
    });

    connection.onclose((error) => {
      setSignalRConnected(false);
      setConnectionStatus('disconnected');
      stopHeartbeat();

      if (!isConnectingRef.current) {
        attemptReconnect();
      }
    });

    connection.onreconnecting((error) => {
      setSignalRConnected(false);
      setConnectionStatus('reconnecting');
    });

    connection.onreconnected((connectionId) => {
      setSignalRConnected(true);
      setConnectionStatus('connected');
      reconnectAttemptRef.current = 0;
      startHeartbeat();
    });

    connectionRef.current = connection;

    const initialConnect = async () => {
      isConnectingRef.current = true;
      setConnectionStatus('reconnecting');

      try {
        await connection.start();
        setSignalRConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptRef.current = 0;
        startHeartbeat();
        isConnectingRef.current = false;
      } catch (err) {
        setSignalRConnected(false);
        setConnectionStatus('disconnected');
        reconnectAttemptRef.current = 0;
        isConnectingRef.current = false;
        attemptReconnect();
      }
    };

    initialConnect();

    return () => {
      stopHeartbeat();
      clearReconnectTimeout();

      if (connection) {
        connection.stop();
      }
    };
  }, []);

  const checkRegistrations = async () => {
    if (!signalRConnected) {
      setRegistrationsError('Unavailable');
      return;
    }

    setLoadingRegistrations(true);
    setRegistrationsError(null);
    setRegistrations([]);

    try {
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

    } catch (error) {
      setRegistrationsError(error.message);
      setLoadingRegistrations(false);
    }
  };

  return (
    <div className="app">
      <h1>Cars API Dashboard</h1>
      <Navigation />

      <Routes>
        <Route path="/" element={<CarsPage />} />
        <Route
          path="/registration"
          element={
            <RegistrationPage
              signalRConnected={signalRConnected}
              connectionStatus={connectionStatus}
              registrations={registrations}
              loadingRegistrations={loadingRegistrations}
              registrationsError={registrationsError}
              onCheckRegistrations={checkRegistrations}
            />
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
