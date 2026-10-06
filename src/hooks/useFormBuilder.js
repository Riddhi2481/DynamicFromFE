import { useState, useCallback } from 'react';
import { createDefaultField, duplicateField as duplicateFieldHelper, normalizeDisplayOrders } from '../utils/schemaUtils';

/**
 * Custom Hook managing Form Builder state (fields list, selected item, property mutations, reordering, duplicate)
 */
export const useFormBuilder = (initialSchema = null) => {
  const [formMetadata, setFormMetadata] = useState({
    id: initialSchema?.id || null,
    title: initialSchema?.title || 'Untitled Form',
    description: initialSchema?.description || '',
    formCode: initialSchema?.formCode || '',
    status: initialSchema?.status || 'DRAFT',
    version: initialSchema?.version || '1'
  });

  const [fields, setFields] = useState(initialSchema?.fields || []);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [conditions, setConditions] = useState(initialSchema?.conditions || []);

  // Add Component
  const addField = useCallback((type) => {
    setFields((prevFields) => {
      const newField = createDefaultField(type, prevFields.length);
      setSelectedFieldId(newField.id);
      return normalizeDisplayOrders([...prevFields, newField]);
    });
  }, []);

  // Remove Component
  const removeField = useCallback((id) => {
    setFields((prevFields) => {
      const filtered = prevFields.filter((f) => f.id !== id);
      return normalizeDisplayOrders(filtered);
    });
    setSelectedFieldId((prev) => (prev === id ? null : prev));
  }, []);

  // Duplicate Component
  const duplicateFieldItem = useCallback((id) => {
    setFields((prevFields) => {
      const targetIndex = prevFields.findIndex((f) => f.id === id);
      if (targetIndex === -1) return prevFields;

      const targetField = prevFields[targetIndex];
      const cloned = duplicateFieldHelper(targetField, targetIndex + 1);

      const nextFields = [...prevFields];
      nextFields.splice(targetIndex + 1, 0, cloned);
      setSelectedFieldId(cloned.id);
      return normalizeDisplayOrders(nextFields);
    });
  }, []);

  // Update Properties
  const updateField = useCallback((id, updatedProps) => {
    setFields((prevFields) =>
      prevFields.map((f) => (f.id === id ? { ...f, ...updatedProps } : f))
    );
  }, []);

  // Reorder Components
  const moveField = useCallback((fromIndex, toIndex) => {
    setFields((prevFields) => {
      if (toIndex < 0 || toIndex >= prevFields.length) return prevFields;
      const result = Array.from(prevFields);
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return normalizeDisplayOrders(result);
    });
  }, []);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  return {
    formMetadata,
    setFormMetadata,
    fields,
    setFields,
    selectedFieldId,
    setSelectedFieldId,
    selectedField,
    conditions,
    setConditions,
    addField,
    removeField,
    duplicateFieldItem,
    updateField,
    moveField
  };
};
