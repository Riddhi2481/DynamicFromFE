import React from 'react';

const FieldWrapper = ({ field, error, children }) => {
  if (field?.visible === false) return null;

  return (
    <div className="mb-3">
      {field?.fieldLabel && (
        <label className="form-label fw-semibold text-dark mb-1">
          {field.fieldLabel}
          {field.required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      {children}
      {field?.helpText && <div className="form-text text-muted fs-7">{field.helpText}</div>}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

export default FieldWrapper;
