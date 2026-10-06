import React from 'react';
import FieldWrapper from './FieldWrapper';

const CheckboxField = ({ field, value = [], onChange, onBlur, error }) => {
  const currentValues = Array.isArray(value) ? value : [];

  const handleToggle = (optValue) => {
    const next = currentValues.includes(optValue)
      ? currentValues.filter((v) => v !== optValue)
      : [...currentValues, optValue];
    onChange && onChange(field.fieldCode, next);
  };

  return (
    <FieldWrapper field={field} error={error}>
      <div className="d-flex flex-column gap-2">
        {(field.options || []).map((opt, idx) => (
          <div className="form-check" key={idx}>
            <input
              type="checkbox"
              id={`${field.fieldCode}_${idx}`}
              className={`form-check-input ${error ? 'is-invalid' : ''}`}
              value={opt.value}
              checked={currentValues.includes(opt.value)}
              disabled={field.disabled}
              onChange={() => handleToggle(opt.value)}
              onBlur={() => onBlur && onBlur(field.fieldCode)}
            />
            <label className="form-check-label text-dark" htmlFor={`${field.fieldCode}_${idx}`}>
              {opt.label}
            </label>
          </div>
        ))}
      </div>
    </FieldWrapper>
  );
};

export default CheckboxField;
