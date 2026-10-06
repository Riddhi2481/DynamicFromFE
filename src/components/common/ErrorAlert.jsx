import React from 'react';

const ErrorAlert = ({ title = 'Application Error', message = 'Something went wrong.', onRetry }) => {
  return (
    <div className="alert alert-danger alert-dismissible fade show shadow-sm my-3" role="alert">
      <div className="d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill fs-3 me-3 text-danger"></i>
        <div>
          <h5 className="alert-heading mb-1">{title}</h5>
          <p className="mb-0 fs-7">{message}</p>
        </div>
      </div>
      {onRetry && (
        <div className="mt-3">
          <button className="btn btn-outline-danger btn-sm" onClick={onRetry}>
            <i className="bi bi-arrow-clockwise me-1"></i> Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorAlert;
