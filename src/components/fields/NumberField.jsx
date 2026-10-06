import React from 'react';
import FieldWrapper from './FieldWrapper';

const NumberField = ({ field, value = '', onChange, onBlur, error }) => {
  return (
    <FieldWrapper field={field} error={error}>
      <input
        type="text"
        inputMode={field.type === 'DECIMAL' ? 'decimal' : 'numeric'}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        placeholder={field.placeholder || ''}
        value={value}
        disabled={field.disabled}
        readOnly={field.readOnly}
        onChange={(e) => onChange && onChange(field.fieldCode, e.target.value)}
        onBlur={() => onBlur && onBlur(field.fieldCode)}
      />
    </FieldWrapper>
  );
};

export default NumberField;
