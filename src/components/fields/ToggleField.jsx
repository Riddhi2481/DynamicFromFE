import React from 'react';
import FieldWrapper from './FieldWrapper';

const ToggleField = ({ field, value = false, onChange, onBlur, error }) => {
  const isChecked = Boolean(value);

  return (
    <FieldWrapper field={field} error={error}>
      <div className="form-check form-switch fs-6">
        <input
          className={`form-check-input ${error ? 'is-invalid' : ''}`}
          type="checkbox"
          id={field.fieldCode}
          checked={isChecked}
          disabled={field.disabled}
          onChange={(e) => onChange && onChange(field.fieldCode, e.target.checked)}
          onBlur={() => onBlur && onBlur(field.fieldCode)}
        />
        <label className="form-check-label fw-semibold text-dark ms-2" htmlFor={field.fieldCode}>
          {field.placeholder || field.fieldLabel || 'Enable'}
        </label>
      </div>
    </FieldWrapper>
  );
};

export default ToggleField;
