function RegistrationPage({
  signalRConnected,
  connectionStatus,
  registrations,
  loadingRegistrations,
  registrationsError,
  onCheckRegistrations
}) {
  const getStatusIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return { text: 'Ready', className: 'connected' };
      case 'reconnecting':
        return { text: 'Reconnecting...', className: 'reconnecting' };
      case 'disconnected':
      default:
        return { text: 'Unavailable', className: 'disconnected' };
    }
  };

  const statusIndicator = getStatusIndicator();

  return (
    <section className="section">
      <h2>Registration Status</h2>

      <div className="controls">
        <button
          onClick={onCheckRegistrations}
          disabled={loadingRegistrations || !signalRConnected}
        >
          {loadingRegistrations ? 'Processing...' : 'Check Registrations'}
        </button>

        <span className={`status-indicator ${statusIndicator.className}`}>
          {connectionStatus === 'reconnecting' && <span className="pulse">⟳ </span>}
          {connectionStatus === 'connected' && '✓ '}
          {connectionStatus === 'disconnected' && '✗ '}
          {statusIndicator.text}
        </span>
      </div>

      {loadingRegistrations && (
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Processing registration checks...</p>
        </div>
      )}

      {registrationsError && <div className="error">Error: {registrationsError}</div>}

      {registrations.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>VIN</th>
              <th>Licence Plate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg, index) => (
              <tr key={index} className={reg.isValid ? 'valid' : 'expired'}>
                <td>{reg.vin}</td>
                <td>{reg.licencePlate}</td>
                <td>{reg.isValid ? 'Valid' : 'Expired'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loadingRegistrations && <p className="no-data">Click "Check Registrations" to retrieve data.</p>
      )}
    </section>
  );
}

export default RegistrationPage;
