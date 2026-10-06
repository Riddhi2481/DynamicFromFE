import React from 'react';
import FieldWrapper from './FieldWrapper';

const DateField = ({ field, value = '', onChange, onBlur, error }) => {
  return (
    <FieldWrapper field={field} error={error}>
      <input
        type={field.type === 'DATE_TIME' ? 'datetime-local' : 'date'}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        value={value}
        disabled={field.disabled}
        readOnly={field.readOnly}
        onChange={(e) => onChange && onChange(field.fieldCode, e.target.value)}
        onBlur={() => onBlur && onBlur(field.fieldCode)}
      />
    </FieldWrapper>
  );
};

export default DateField;
