import React from 'react';
import FieldWrapper from './FieldWrapper';

const DropdownField = ({ field, value = '', onChange, onBlur, error }) => {
  return (
    <FieldWrapper field={field} error={error}>
      <select
        className={`form-select ${error ? 'is-invalid' : ''}`}
        value={value}
        disabled={field.disabled}
        onChange={(e) => onChange && onChange(field.fieldCode, e.target.value)}
        onBlur={() => onBlur && onBlur(field.fieldCode)}
      >
        <option value="">{field.placeholder || '-- Select an option --'}</option>
        {(field.options || []).map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
};

export default DropdownField;
