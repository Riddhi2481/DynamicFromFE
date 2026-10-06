import React from 'react';
import FieldWrapper from './FieldWrapper';

const MultiSelectField = ({ field, value = [], onChange, onBlur, error }) => {
  const selectedValues = Array.isArray(value) ? value : [];

  const handleSelectChange = (e) => {
    const options = Array.from(e.target.selectedOptions, (option) => option.value);
    onChange && onChange(field.fieldCode, options);
  };

  return (
    <FieldWrapper field={field} error={error}>
      <select
        multiple
        className={`form-select ${error ? 'is-invalid' : ''}`}
        size={Math.min(5, Math.max(3, (field.options || []).length))}
        value={selectedValues}
        disabled={field.disabled}
        onChange={handleSelectChange}
        onBlur={() => onBlur && onBlur(field.fieldCode)}
      >
        {(field.options || []).map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="form-text fs-7">Hold Ctrl (or Cmd) to select multiple items.</div>
    </FieldWrapper>
  );
};

export default MultiSelectField;
