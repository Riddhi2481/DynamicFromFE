import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import FormBuilderLayout from '../../components/form-builder/FormBuilderLayout';
import ComponentPalette from '../../components/form-builder/ComponentPalette';
import FormCanvas from '../../components/form-builder/FormCanvas';
import PropertyPanel from '../../components/form-builder/PropertyPanel';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import ToastNotification from '../../components/common/ToastNotification';
import Modal from '../../components/common/Modal';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { formApi } from '../../services/formApi';
import { validateAllFormComponents } from '../../utils/validationUtils';

const FormBuilderPage = () => {
  const { formId } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const {
    formMetadata,
    setFormMetadata,
    fields,
    setFields,
    selectedFieldId,
    selectedField,
    setSelectedFieldId,
    conditions,
    setConditions,
    addField,
    removeField,
    duplicateFieldItem,
    updateField,
    moveField
  } = useFormBuilder();

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadFormSchema = useCallback(async () => {
    if (!formId || formId === 'new') return;
    setLoading(true);
    setError(null);
    try {
      const res = await formApi.getFormById(formId);
      const data = res?.data?.data || res?.data?.form || res?.data || res;
      if (data) {
        const draftVer = data.currentDraftVersion || data.publishedVersion || 1;
        setFormMetadata({
          id: data.id || formId,
          title: data.title || data.name || 'Untitled Form',
          description: data.description || '',
          category: data.category || '',
          formCode: data.formCode || data.code || '',
          status: data.publishedVersion ? 'PUBLISHED' : 'DRAFT',
          version: draftVer
        });

        try {
          const versionRes = await formApi.getVersion(formId, draftVer);
          const versionData = versionRes?.data?.data || versionRes?.data || versionRes;
          const extractedComps = (versionData?.sections || []).flatMap(s => s.components || []);
          const mappedFields = extractedComps.map((comp, idx) => {
            let compType = (comp.componentType || comp.type || 'TEXT').toUpperCase();
            if (compType === 'TEXTAREA') compType = 'TEXT_AREA';
            if (compType === 'SELECT') compType = 'DROPDOWN';

            let min = comp.min;
            let max = comp.max;
            let minLength = comp.minLength;
            let maxLength = comp.maxLength;
            let regexPattern = comp.regexPattern || comp.regex;

            (comp.validationRules || []).forEach(r => {
              const vType = (r.validationType || r.type || '').toUpperCase();
              const rVal = r.ruleValue;
              if (vType === 'MIN_VALUE' || vType === 'MIN') {
                min = rVal !== undefined && rVal !== null ? rVal : min;
              } else if (vType === 'MAX_VALUE' || vType === 'MAX') {
                max = rVal !== undefined && rVal !== null ? rVal : max;
              } else if (vType === 'MIN_LENGTH') {
                minLength = rVal !== undefined && rVal !== null ? rVal : minLength;
                if (compType === 'TEXT' || compType === 'TEXT_AREA') min = minLength;
              } else if (vType === 'MAX_LENGTH') {
                maxLength = rVal !== undefined && rVal !== null ? rVal : maxLength;
                if (compType === 'TEXT' || compType === 'TEXT_AREA') max = maxLength;
              } else if (vType === 'REGEX') {
                regexPattern = rVal || regexPattern;
              }
            });

            return {
              id: comp.id ? String(comp.id) : (comp.fieldCode || `field_${idx}`),
              fieldCode: comp.fieldCode || `field_${idx + 1}`,
              fieldLabel: comp.label || comp.fieldLabel || 'Untitled Field',
              label: comp.label || comp.fieldLabel || 'Untitled Field',
              type: compType,
              componentType: compType,
              placeholder: comp.placeholder || '',
              helpText: comp.helpText || '',
              defaultValue: comp.defaultValue !== undefined && comp.defaultValue !== null ? String(comp.defaultValue) : '',
              displayOrder: comp.sortOrder !== undefined ? comp.sortOrder : idx + 1,
              required: !!comp.required,
              disabled: !!comp.disabled,
              readOnly: !!comp.readOnly,
              visible: comp.visible !== false,
              min,
              max,
              minLength,
              maxLength,
              regexPattern,
              options: (comp.options || []).map((opt, oIdx) => ({
                id: opt.id,
                label: opt.optionLabel || opt.label || `Option ${oIdx + 1}`,
                value: opt.optionValue || opt.value || `option_${oIdx + 1}`,
                optionLabel: opt.optionLabel || opt.label || `Option ${oIdx + 1}`,
                optionValue: opt.optionValue || opt.value || `option_${oIdx + 1}`,
                sortOrder: opt.sortOrder || oIdx + 1,
                isDefault: !!opt.isDefault
              })),
              validationRules: comp.validationRules || []
            };
          });
          setFields(mappedFields);
          setConditions(versionData?.conditions || []);
        } catch (vErr) {
          console.warn('Could not load version details:', vErr);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load form schema configuration');
    } finally {
      setLoading(false);
    }
  }, [formId, setFields, setFormMetadata, setConditions]);

  useEffect(() => {
    loadFormSchema();
  }, [loadFormSchema]);

  const handleSaveSchema = async () => {
    // Configuration-Time Validation
    const validationResult = validateAllFormComponents(fields);
    if (!validationResult.isValid) {
      if (validationResult.firstInvalidFieldId) {
        setSelectedFieldId(validationResult.firstInvalidFieldId);
      }
      showToast('Validation Error', 'Cannot save configuration. Please fix invalid field properties in the Inspector.', 'danger');
      return;
    }

    setSaving(true);
    try {
      const componentsPayload = fields.map((field, idx) => {
        let compType = (field.type || field.componentType || 'TEXT').toUpperCase();
        if (compType === 'TEXTAREA') compType = 'TEXT_AREA';
        if (compType === 'SELECT') compType = 'DROPDOWN';

        const optionsPayload = (field.options || []).map((opt, oIdx) => ({
          optionLabel: opt.label || opt.optionLabel || `Option ${oIdx + 1}`,
          optionValue: opt.value || opt.optionValue || `option_${oIdx + 1}`,
          sortOrder: opt.sortOrder !== undefined ? opt.sortOrder : oIdx + 1,
          isDefault: !!opt.isDefault
        }));

        const validationRulesPayload = [];
        let hasMinRule = false;
        let hasMaxRule = false;

        if (field.validationRules && Array.isArray(field.validationRules) && field.validationRules.length > 0) {
          field.validationRules.forEach(r => {
            const vType = (r.validationType || r.type || '').toUpperCase();
            let ruleVal = r.ruleValue !== undefined ? String(r.ruleValue) : '';

            if (vType === 'MIN_VALUE' || vType === 'MIN_LENGTH' || vType === 'MIN') {
              hasMinRule = true;
              if (field.min !== undefined && field.min !== null && field.min !== '') {
                ruleVal = String(field.min);
              }
            } else if (vType === 'MAX_VALUE' || vType === 'MAX_LENGTH' || vType === 'MAX') {
              hasMaxRule = true;
              if (field.max !== undefined && field.max !== null && field.max !== '') {
                ruleVal = String(field.max);
              }
            }

            validationRulesPayload.push({
              validationType: vType,
              ruleValue: ruleVal,
              errorMessage: r.errorMessage || ''
            });
          });
        }

        if (!hasMinRule && field.min !== undefined && field.min !== null && field.min !== '') {
          validationRulesPayload.push({
            validationType: (compType === 'NUMBER' || compType === 'DECIMAL') ? 'MIN_VALUE' : 'MIN_LENGTH',
            ruleValue: String(field.min),
            errorMessage: `Minimum value is ${field.min}`
          });
        }
        if (!hasMaxRule && field.max !== undefined && field.max !== null && field.max !== '') {
          validationRulesPayload.push({
            validationType: (compType === 'NUMBER' || compType === 'DECIMAL') ? 'MAX_VALUE' : 'MAX_LENGTH',
            ruleValue: String(field.max),
            errorMessage: `Maximum value is ${field.max}`
          });
        }

        return {
          fieldCode: field.fieldCode || `field_${idx + 1}`,
          label: field.fieldLabel || field.label || 'Untitled Field',
          componentType: compType,
          placeholder: field.placeholder || '',
          defaultValue: field.defaultValue !== undefined && field.defaultValue !== null ? String(field.defaultValue) : '',
          sortOrder: field.displayOrder !== undefined ? field.displayOrder : idx + 1,
          required: !!field.required,
          visible: field.visible !== false,
          options: optionsPayload,
          validationRules: validationRulesPayload,
          childComponents: []
        };
      });

      const payload = {
        title: formMetadata.title || 'Untitled Form',
        description: formMetadata.description || '',
        category: formMetadata.category || null,
        sections: [
          {
            sectionCode: 'main_section',
            title: 'Main Section',
            description: 'Default section container',
            sortOrder: 1,
            components: componentsPayload
          }
        ],
        conditions: conditions || []
      };

      if (formId && formId !== 'new') {
        const updateRes = await formApi.updateForm(formId, payload);
        const updatedData = updateRes?.data?.data || updateRes?.data;
        if (updatedData) {
          setFormMetadata(prev => ({
            ...prev,
            title: updatedData.title || prev.title,
            description: updatedData.description || prev.description,
            category: updatedData.category || prev.category,
            version: updatedData.currentDraftVersion || prev.version
          }));
        }
      } else {
        const createPayload = {
          formCode: formMetadata.formCode || `FORM_${Date.now()}`,
          title: formMetadata.title || 'Untitled Form',
          description: formMetadata.description || '',
          category: formMetadata.category || null,
          initialSections: payload.sections,
          initialConditions: payload.conditions
        };
        const createRes = await formApi.createForm(createPayload);
        const createdData = createRes?.data?.data || createRes?.data;
        if (createdData?.id) {
          setFormMetadata(prev => ({
            ...prev,
            id: createdData.id,
            version: createdData.currentDraftVersion || prev.version
          }));
        }
      }

      setSaving(false);
      showToast('Schema Saved', 'Form configuration saved successfully to backend.');
    } catch (err) {
      setSaving(false);
      showToast('Save Error', err.message || 'Failed to save form schema.', 'danger');
    }
  };

  const currentSchemaJson = JSON.stringify(
    {
      ...formMetadata,
      fields: fields
    },
    null,
    2
  );

  return (
    <Layout>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Top Builder Control Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-3 border-bottom gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bold text-dark mb-0">{formMetadata.title}</h3>
            <StatusBadge status={formMetadata.status} />
          </div>
          <p className="text-muted fs-7 mb-0">
            ID: <span className="font-monospace text-dark">{formId}</span> | Code:{' '}
            <span className="font-monospace text-primary">{formMetadata.formCode || 'NOT_SET'}</span> | Version:{' '}
            <span className="badge bg-light text-dark border">v{formMetadata.version}</span>
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={() => setShowJsonModal(true)}
            title="Inspect Generated JSON Schema"
          >
            <i className="bi bi-code-slash me-1"></i> JSON Schema
          </button>
          <Link
            to={`/preview/${formId}`}
            state={{ schema: { fields, conditions }, formMeta: formMetadata }}
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-eye me-1"></i> Preview
          </Link>
          <button
            type="button"
            className="btn btn-success fw-semibold"
            onClick={handleSaveSchema}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-cloud-upload me-1"></i> Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner message="Loading dynamic form configuration..." />}

      {error && <ErrorAlert title="Builder Schema Error" message={error} onRetry={loadFormSchema} />}

      {!loading && !error && (
        <FormBuilderLayout
          palette={<ComponentPalette onAddField={addField} />}
          canvas={
            <FormCanvas
              fields={fields}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onRemoveField={removeField}
              onDuplicateField={duplicateFieldItem}
              onMoveField={moveField}
              onDropNewField={addField}
            />
          }
          propertyPanel={
            <PropertyPanel
              field={selectedField}
              onUpdateField={updateField}
            />
          }
        />
      )}

      {/* JSON Schema Inspection Modal */}
      <Modal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        title="Dynamic Form Configuration Schema JSON"
        footerButtons={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowJsonModal(false)}
          >
            Close
          </button>
        }
      >
        <p className="text-muted fs-7 mb-2">
          This JSON schema represents the configuration produced by the builder and consumed by the Dynamic Renderer:
        </p>
        <pre className="bg-dark text-light p-3 rounded font-monospace fs-7 overflow-auto" style={{ maxHeight: '400px' }}>
          <code>{currentSchemaJson}</code>
        </pre>
      </Modal>
    </Layout>
  );
};

export default FormBuilderPage;
