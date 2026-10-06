import React, { useState } from 'react';
import Modal from '../common/Modal';
import { formApi } from '../../services/formApi';

const DeleteFormModal = ({ isOpen, onClose, form, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!form?.id) return;
    setSubmitting(true);
    setError(null);
    try {
      await formApi.deleteForm(form.id);
      setSubmitting(false);
      onSuccess && onSuccess(form.id);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Failed to delete form');
    }
  };

  if (!isOpen || !form) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Delete Form"
      footerButtons={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
            {submitting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger py-2 fs-7 mb-3">{error}</div>}

      <div className="text-center p-3">
        <i className="bi bi-exclamation-octagon text-danger display-4 mb-2"></i>
        <h5 className="fw-bold text-dark mb-2">Are you sure you want to delete this form?</h5>
        <p className="text-muted fs-7 mb-0">
          Form: <strong>{form.title}</strong> (<span className="font-monospace">{form.formCode}</span>).
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
};

export default DeleteFormModal;
