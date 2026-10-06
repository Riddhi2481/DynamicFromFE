import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { formApi } from '../../services/formApi';

const EditFormModal = ({ isOpen, onClose, form, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    formCode: '',
    description: '',
    category: 'General'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (form) {
      setFormData({
        title: form.title || '',
        formCode: form.formCode || '',
        description: form.description || '',
        category: form.category || 'General'
      });
    }
  }, [form]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Form Name is required.';
    if (!formData.formCode.trim()) errs.formCode = 'Form Code is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const updatedPayload = {
        ...form,
        title: formData.title.trim(),
        formCode: formData.formCode.trim(),
        description: formData.description.trim(),
        category: formData.category
      };

      const result = await formApi.updateForm(form.id, updatedPayload);
      setSubmitting(false);
      onSuccess && onSuccess(result || updatedPayload);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setApiError(err.message || 'Failed to update form');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Form: ${form?.title || ''}`}
      footerButtons={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      {apiError && <div className="alert alert-danger py-2 mb-3 fs-7">{apiError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Form Name</label>
          <input
            type="text"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Form Code</label>
          <input
            type="text"
            className={`form-control font-monospace ${errors.formCode ? 'is-invalid' : ''}`}
            value={formData.formCode}
            onChange={(e) => setFormData({ ...formData, formCode: e.target.value.toUpperCase() })}
          />
          {errors.formCode && <div className="invalid-feedback">{errors.formCode}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Category</label>
          <input
            type="text"
            className="form-control"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>
      </form>
    </Modal>
  );
};

export default EditFormModal;
