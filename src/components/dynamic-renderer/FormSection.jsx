import React from 'react';

const FormSection = ({ title, description, children }) => {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white border-bottom py-3">
        <h4 className="card-title fw-bold text-dark mb-1">{title}</h4>
        {description && <p className="card-text text-muted fs-7 mb-0">{description}</p>}
      </div>
      <div className="card-body p-4">{children}</div>
    </div>
  );
};

export default FormSection;
