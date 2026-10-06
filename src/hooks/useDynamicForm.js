import { useState, useCallback, useMemo, useEffect } from 'react';
import { validateForm, validateField } from '../utils/validationUtils';
import { applyConditionActions } from '../utils/conditionUtils';

/**
 * Custom Hook managing end-user dynamic form state (live values, field error states, dynamic reactive states)
 */
export const useDynamicForm = (schema = { fields: [], conditions: [] }) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Sync initial values when schema is loaded from backend
  useEffect(() => {
    if (schema?.fields && schema.fields.length > 0) {
      setValues((prev) => {
        const next = { ...prev };
        schema.fields.forEach((field) => {
          if (next[field.fieldCode] === undefined) {
            next[field.fieldCode] = field.defaultValue !== undefined ? field.defaultValue : '';
          }
        });
        return next;
      });
    }
  }, [schema.fields]);

  // Compute reactive field states (visibility, required, disabled) from conditional engine
  const fieldStates = useMemo(() => {
    return applyConditionActions(schema.fields || [], schema.conditions || [], values);
  }, [schema.fields, schema.conditions, values]);

  // Value Change Handler - clears field error immediately on user correction
  const handleChange = useCallback(
    (fieldCode, value) => {
      setValues((prev) => ({ ...prev, [fieldCode]: value }));
      setErrors((prev) => {
        if (!prev[fieldCode]) return prev;
        const next = { ...prev };
        delete next[fieldCode];
        return next;
      });
    },
    []
  );

  // Field Blur Handler - validates specific field on blur
  const handleBlur = useCallback(
    (fieldCode) => {
      setTouched((prev) => ({ ...prev, [fieldCode]: true }));
      const field = (schema.fields || []).find((f) => f.fieldCode === fieldCode);
      if (field) {
        const dynamicState = fieldStates[fieldCode] || {};
        const mergedField = {
          ...field,
          required: dynamicState.required !== undefined ? dynamicState.required : field.required
        };
        const fieldErrors = validateField(mergedField, values[fieldCode]);
        setErrors((prev) => ({
          ...prev,
          [fieldCode]: fieldErrors.length > 0 ? fieldErrors[0] : null
        }));
      }
    },
    [schema.fields, values, fieldStates]
  );

  // Form Pre-Submit Full Validation Check
  const validateAll = useCallback(() => {
    // Merge dynamic required states
    const activeFields = (schema.fields || []).map((f) => {
      const dynamicState = fieldStates[f.fieldCode] || {};
      return {
        ...f,
        visible: dynamicState.visible !== undefined ? dynamicState.visible : f.visible,
        required: dynamicState.required !== undefined ? dynamicState.required : f.required
      };
    });

    const result = validateForm(activeFields, values);
    setErrors(result.errors);
    return result.isValid;
  }, [schema.fields, values, fieldStates]);

  return {
    values,
    setValues,
    errors,
    setErrors,
    touched,
    fieldStates,
    handleChange,
    handleBlur,
    validateAll
  };
};
