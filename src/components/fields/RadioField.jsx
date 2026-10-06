import React from 'react';
import FieldWrapper from './FieldWrapper';

const RadioField = ({ field, value = '', onChange, onBlur, error }) => {
  return (
    <FieldWrapper field={field} error={error}>
      <div className="d-flex flex-column gap-2">
        {(field.options || []).map((opt, idx) => (
          <div className="form-check" key={idx}>
            <input
              type="radio"
              id={`${field.fieldCode}_${idx}`}
              name={field.fieldCode}
              className={`form-check-input ${error ? 'is-invalid' : ''}`}
              value={opt.value}
              checked={String(value) === String(opt.value)}
              disabled={field.disabled}
              onChange={(e) => onChange && onChange(field.fieldCode, e.target.value)}
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

export default RadioField;
