import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import DynamicFormRenderer from '../../components/dynamic-renderer/DynamicFormRenderer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useDynamicForm } from '../../hooks/useDynamicForm';
import { formApi } from '../../services/formApi';

/**
 * Form Preview Page for Administrators.
 * Flow: Form Builder / Backend API -> Current Configuration -> Preview -> DynamicFormRenderer
 * Reuses the EXACT SAME DynamicFormRenderer engine as end-user forms.
 */
const FormPreviewPage = () => {
  const { formId } = useParams();
  const location = useLocation();

  const [schema, setSchema] = useState({ fields: [], conditions: [] });
  const [formMeta, setFormMeta] = useState({ title: 'Form Preview', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const { values, errors, fieldStates, handleChange, handleBlur, validateAll } = useDynamicForm(schema);

  const normalizeFields = (rawList = []) => {
    return (Array.isArray(rawList) ? rawList : []).map((comp, idx) => {
      let type = (comp.type || comp.componentType || 'TEXT').toUpperCase();
      if (type === 'TEXTAREA') type = 'TEXT_AREA';
      if (type === 'SELECT') type = 'DROPDOWN';

      let min = comp.min;
      let max = comp.max;
      let minLength = comp.minLength;
      let maxLength = comp.maxLength;
      let regexPattern = comp.regexPattern || comp.regex;

      (comp.validationRules || []).forEach(r => {
        const vType = (r.validationType || r.type || '').toUpperCase();
        const rVal = r.ruleValue;
        if (vType === 'MIN_VALUE' || vType === 'MIN') {
          min = rVal !== undefined && rVal !== null ? Number(rVal) : min;
        } else if (vType === 'MAX_VALUE' || vType === 'MAX') {
          max = rVal !== undefined && rVal !== null ? Number(rVal) : max;
        } else if (vType === 'MIN_LENGTH') {
          minLength = rVal !== undefined && rVal !== null ? Number(rVal) : minLength;
          if (type === 'TEXT' || type === 'TEXT_AREA') min = minLength;
        } else if (vType === 'MAX_LENGTH') {
          maxLength = rVal !== undefined && rVal !== null ? Number(rVal) : maxLength;
          if (type === 'TEXT' || type === 'TEXT_AREA') max = maxLength;
        } else if (vType === 'REGEX') {
          regexPattern = rVal || regexPattern;
        }
      });

      return {
        ...comp,
        id: comp.id ? String(comp.id) : (comp.fieldCode || `field_${idx}`),
        fieldCode: comp.fieldCode || comp.code || comp.name || `field_${idx}`,
        fieldLabel: comp.label || comp.fieldLabel || comp.title || comp.name || 'Untitled Field',
        label: comp.label || comp.fieldLabel || comp.title || comp.name || 'Untitled Field',
        type: type,
        componentType: type,
        displayOrder: comp.sortOrder !== undefined ? comp.sortOrder : (comp.displayOrder !== undefined ? comp.displayOrder : idx + 1),
        visible: comp.visible !== false,
        required: !!comp.required,
        disabled: !!comp.disabled,
        readOnly: !!comp.readOnly,
        placeholder: comp.placeholder || '',
        helpText: comp.helpText || '',
        defaultValue: comp.defaultValue !== undefined && comp.defaultValue !== null ? comp.defaultValue : '',
        min,
        max,
        minLength,
        maxLength,
        regexPattern,
        options: (comp.options || comp.componentOptions || []).map((opt, oIdx) => ({
          id: opt.id,
          label: opt.label || opt.optionLabel || `Option ${oIdx + 1}`,
          value: opt.value || opt.optionValue || `option_${oIdx + 1}`,
          optionLabel: opt.label || opt.optionLabel || `Option ${oIdx + 1}`,
          optionValue: opt.value || opt.optionValue || `option_${oIdx + 1}`,
          sortOrder: opt.sortOrder || oIdx + 1,
          isDefault: !!opt.isDefault
        })),
        validationRules: comp.validationRules || []
      };
    });
  };

  const loadSchema = useCallback(async () => {
    if (!formId || formId === 'new') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await formApi.getFormById(formId);
      const data = res?.data?.data || res?.data?.form || res?.data || res;
      if (data) {
        setFormMeta({
          title: data.title || data.name || 'Form Preview',
          description: data.description || ''
        });

        const versionNum = data.currentDraftVersion || data.publishedVersion || 1;
        try {
          const versionRes = await formApi.getVersion(formId, versionNum);
          const versionData = versionRes?.data?.data || versionRes?.data || versionRes;
          const rawComponents = (versionData?.sections || []).flatMap(s => s.components || []);

          setSchema({
            fields: normalizeFields(rawComponents),
            conditions: versionData?.conditions || []
          });
        } catch (vErr) {
          setSchema({
            fields: normalizeFields(data.fields || []),
            conditions: data.conditions || []
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load form configuration from backend');
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadSchema();
  }, [loadSchema]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAll()) {
      setSubmittedData(values);
    }
  };

  return (
    <Layout>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bold text-dark mb-0">{formMeta.title}</h3>
            <span className="badge bg-info text-white">Administrator Preview Mode</span>
          </div>
          <p className="text-muted fs-7 mb-0">
            Form ID: <span className="font-monospace">{formId}</span> | Configuration-Driven Dynamic Form Renderer
          </p>
        </div>
        <Link to={`/builder/${formId}`} className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i> Back to Builder
        </Link>
      </div>

      {loading && <LoadingSpinner message="Loading form configuration..." />}

      {error && <ErrorAlert title="Preview Error" message={error} onRetry={loadSchema} />}

      {!loading && !error && (
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="card shadow-sm border-0 p-4">
              <div className="border-bottom pb-3 mb-4">
                <h4 className="fw-bold text-primary mb-1">{formMeta.title}</h4>
                {formMeta.description && <p className="text-muted fs-7 mb-0">{formMeta.description}</p>}
              </div>

              {submittedData ? (
                <div className="alert alert-success border-success p-4">
                  <h5 className="alert-heading fw-bold mb-2">
                    <i className="bi bi-check-circle-fill me-2"></i> Preview Validation &amp; Submission Test Passed!
                  </h5>
                  <p className="fs-7 mb-3">Form Response Data Payload:</p>
                  <pre className="bg-white p-3 rounded border font-monospace fs-7 mb-3">
                    <code>{JSON.stringify(submittedData, null, 2)}</code>
                  </pre>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => setSubmittedData(null)}
                  >
                    Test Submit Again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Reuses the EXACT SAME DynamicFormRenderer as end-user forms */}
                  <DynamicFormRenderer
                    schema={schema}
                    values={values}
                    errors={errors}
                    fieldStates={fieldStates}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary px-4 fw-semibold shadow-sm">
                      <i className="bi bi-send me-2"></i> Test Submit Form
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FormPreviewPage;
