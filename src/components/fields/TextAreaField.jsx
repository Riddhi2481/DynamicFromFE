import React from 'react';
import FieldWrapper from './FieldWrapper';

const TextAreaField = ({ field, value = '', onChange, onBlur, error }) => {
  return (
    <FieldWrapper field={field} error={error}>
      <textarea
        className={`form-control ${error ? 'is-invalid' : ''}`}
        rows={field.rows || 3}
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

export default TextAreaField;
