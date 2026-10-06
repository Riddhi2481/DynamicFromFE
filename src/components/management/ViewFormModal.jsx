import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';

const ViewFormModal = ({ isOpen, onClose, form }) => {
  if (!form) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Form Metadata & Details"
      footerButtons={
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="table-responsive">
        <table className="table table-bordered mb-0">
          <tbody>
            <tr>
              <th className="w-30 bg-light">Form Name</th>
              <td className="fw-bold">{form.title}</td>
            </tr>
            <tr>
              <th className="bg-light">Form Code</th>
              <td className="font-monospace text-primary">{form.formCode}</td>
            </tr>
            <tr>
              <th className="bg-light">Category</th>
              <td>{form.category || 'General'}</td>
            </tr>
            <tr>
              <th className="bg-light">Status</th>
              <td>
                <StatusBadge status={form.status} />
              </td>
            </tr>
            <tr>
              <th className="bg-light">Current Version</th>
              <td><span className="badge bg-light text-dark border">v{form.version || '1.0'}</span></td>
            </tr>
            <tr>
              <th className="bg-light">Fields Count</th>
              <td>{form.fields?.length || 0} fields configured</td>
            </tr>
            <tr>
              <th className="bg-light">Description</th>
              <td>{form.description || 'No description provided.'}</td>
            </tr>
            <tr>
              <th className="bg-light">Public Response Endpoint</th>
              <td className="font-monospace fs-7 text-break">
                POST /api/forms/{form.formCode}/submissions
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default ViewFormModal;
