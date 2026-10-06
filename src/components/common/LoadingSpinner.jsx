import React from 'react';

const LoadingSpinner = ({ message = 'Loading form components...' }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center p-5 min-vh-25">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted fw-medium fs-6">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
