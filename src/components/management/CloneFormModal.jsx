import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { formApi } from '../../services/formApi';

const CloneFormModal = ({ isOpen, onClose, form, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    formCode: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (form) {
      setFormData({
        title: `${form.title || 'Form'} (Copy)`,
        formCode: `${form.formCode || 'FORM'}_COPY`
      });
    }
  }, [form]);

  const handleClone = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.formCode.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const clonePayload = {
        ...form,
        id: undefined,
        title: formData.title.trim(),
        formCode: formData.formCode.trim(),
        status: 'DRAFT',
        version: '1',
        createdAt: new Date().toISOString()
      };

      const result = await formApi.createForm(clonePayload);
      setSubmitting(false);
      onSuccess && onSuccess(result || clonePayload);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Failed to clone form');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Clone Form: ${form?.title || ''}`}
      footerButtons={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleClone} disabled={submitting}>
            {submitting ? 'Cloning...' : 'Create Duplicate'}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger py-2 fs-7 mb-3">{error}</div>}

      <form onSubmit={handleClone}>
        <div className="mb-3">
          <label className="form-label fw-semibold">New Form Title</label>
          <input
            type="text"
            className="form-control"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">New Form Code</label>
          <input
            type="text"
            className="form-control font-monospace"
            value={formData.formCode}
            onChange={(e) => setFormData({ ...formData, formCode: e.target.value.toUpperCase() })}
            required
          />
        </div>
      </form>
    </Modal>
  );
};

export default CloneFormModal;
