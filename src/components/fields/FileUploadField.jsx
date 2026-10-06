import React from 'react';
import FieldWrapper from './FieldWrapper';

const FileUploadField = ({ field, onChange, onBlur, error }) => {
  return (
    <FieldWrapper field={field} error={error}>
      <input
        type="file"
        multiple={field.multiple}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        disabled={field.disabled}
        onChange={(e) =>
          onChange &&
          onChange(
            field.fieldCode,
            field.multiple ? Array.from(e.target.files) : e.target.files[0]
          )
        }
        onBlur={() => onBlur && onBlur(field.fieldCode)}
      />
    </FieldWrapper>
  );
};

export default FileUploadField;
