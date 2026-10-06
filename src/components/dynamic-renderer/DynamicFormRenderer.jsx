import React from 'react';
import { getComponentForType } from './ComponentRegistry';
import { sortFieldsByDisplayOrder } from '../../utils/schemaUtils';

/**
 * Pure Configuration-Driven Dynamic Form Renderer Engine.
 * Accepts backend JSON configuration schemas and dynamically renders fields.
 * Reusable for Form Preview and Published End-User Forms.
 */
const DynamicFormRenderer = ({
  schema = { fields: [], conditions: [] },
  values = {},
  errors = {},
  fieldStates = {},
  onChange,
  onBlur
}) => {
  const fieldsList = schema?.fields || [];
  const sortedFields = sortFieldsByDisplayOrder(fieldsList);

  return (
    <div className="dynamic-form-renderer d-flex flex-column gap-2">
      {sortedFields.map((field) => {
        const fieldState = fieldStates[field.fieldCode] || {};

        // Visibility Evaluation
        const isVisible =
          fieldState.visible !== undefined ? fieldState.visible : field.visible !== false;

        if (!isVisible) {
          return null;
        }

        // Reactive Property Merging
        const mergedField = {
          ...field,
          required: fieldState.required !== undefined ? fieldState.required : !!field.required,
          disabled: fieldState.disabled !== undefined ? fieldState.disabled : !!field.disabled,
          readOnly: fieldState.readOnly !== undefined ? fieldState.readOnly : !!field.readOnly
        };

        const Component = getComponentForType(field.type);

        const val =
          values[field.fieldCode] !== undefined
            ? values[field.fieldCode]
            : field.defaultValue !== undefined
            ? field.defaultValue
            : '';

        return (
          <Component
            key={field.id || field.fieldCode}
            field={mergedField}
            value={val}
            error={errors[field.fieldCode]}
            onChange={onChange}
            onBlur={onBlur}
          />
        );
      })}
    </div>
  );
};

export default DynamicFormRenderer;
