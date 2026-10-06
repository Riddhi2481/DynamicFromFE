import React from 'react';

const SectionField = ({ field, children }) => {
  if (field?.visible === false) return null;

  return (
    <div className="card shadow-sm border-0 mb-4 bg-light">
      <div className="card-header bg-white border-bottom py-3">
        <h5 className="card-title fw-bold text-primary mb-1">
          <i className="bi bi-layout-three-columns me-2"></i>
          {field.fieldLabel || 'Section Container'}
        </h5>
        {field.helpText && <p className="card-text text-muted fs-7 mb-0">{field.helpText}</p>}
      </div>
      <div className="card-body p-3">{children}</div>
    </div>
  );
};

export default SectionField;
