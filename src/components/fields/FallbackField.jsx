import React from 'react';

const FallbackField = ({ field }) => {
  return (
    <div className="alert alert-warning border-warning shadow-sm my-3 p-3">
      <div className="d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill text-warning me-3 fs-4"></i>
        <div>
          <h6 className="alert-heading fw-bold mb-1">
            Unsupported Field Type: <span className="font-monospace">{field?.type || 'UNKNOWN'}</span>
          </h6>
          <p className="mb-0 fs-7 text-dark">
            Field Code: <code className="text-dark fw-bold">{field?.fieldCode || 'unnamed'}</code> | Label:{' '}
            <span>{field?.fieldLabel || 'No Label'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FallbackField;
