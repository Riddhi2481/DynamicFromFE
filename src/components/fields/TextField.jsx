import React from 'react';
import FieldWrapper from './FieldWrapper';

const TextField = ({ field, value = '', onChange, onBlur, error }) => {
  return (
    <FieldWrapper field={field} error={error}>
      <input
        type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : 'text'}
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

export default TextField;
