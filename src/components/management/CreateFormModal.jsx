import React, { useState } from 'react';
import Modal from '../common/Modal';
import { formApi } from '../../services/formApi';

const CATEGORIES = [
  'General',
  'HR & Onboarding',
  'Customer Support',
  'Sales & Marketing',
  'Finance & Operations',
  'IT & Security'
];

const CreateFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    formCode: '',
    description: '',
    category: 'General'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Form Name is required.';
    }
    if (!formData.formCode.trim()) {
      errs.formCode = 'Form Code is required.';
    } else if (!/^[A-Z0-9_-]+$/.test(formData.formCode)) {
      errs.formCode = 'Form Code must contain uppercase letters, numbers, underscores or hyphens only.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        formCode: formData.formCode.trim(),
        description: formData.description.trim(),
        category: formData.category,
        status: 'DRAFT',
        version: '1',
        fields: [],
        conditions: []
      };

      const result = await formApi.createForm(payload);
      setSubmitting(false);
      onSuccess && onSuccess(result || payload);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setApiError(err.message || 'Failed to create form');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Dynamic Form"
      footerButtons={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating...
              </>
            ) : (
              <>
                <i className="bi bi-plus-lg me-1"></i> Create Form
              </>
            )}
          </button>
        </>
      }
    >
      {apiError && (
        <div className="alert alert-danger py-2 mb-3 fs-7">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Form Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            placeholder="e.g. Employee Feedback Survey"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Form Code <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control font-monospace ${errors.formCode ? 'is-invalid' : ''}`}
            placeholder="e.g. EMP_FEEDBACK_2026"
            value={formData.formCode}
            onChange={(e) => setFormData({ ...formData, formCode: e.target.value.toUpperCase() })}
          />
          {errors.formCode ? (
            <div className="invalid-feedback">{errors.formCode}</div>
          ) : (
            <div className="form-text fs-7">Unique identifier used by backend REST endpoints.</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Category</label>
          <select
            className="form-select"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Description</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Provide a brief description of the form purpose..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>

        <div className="p-3 bg-light rounded border fs-7 text-muted">
          <i className="bi bi-info-circle me-1 text-primary"></i> Initial state upon creation will be set to{' '}
          <span className="badge bg-warning text-dark">DRAFT</span> and version <span className="badge bg-secondary">1</span>.
        </div>
      </form>
    </Modal>
  );
};

export default CreateFormModal;
