import React, { useState, useEffect, useCallback } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import { formApi } from '../../services/formApi';

const VersionHistoryModal = ({ isOpen, onClose, form, onVersionChange }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [publishingVer, setPublishingVer] = useState(null);

  // Backend Publishing Validation Errors State
  const [validationError, setValidationError] = useState(null);
  const [selectedVersionSchema, setSelectedVersionSchema] = useState(null);

  const fetchVersions = useCallback(async () => {
    const targetId = form?.id || form?._id || form?.formCode;
    if (!targetId) return;
    setLoading(true);
    setValidationError(null);
    try {
      const data = await formApi.getVersions(targetId);
      setVersions(
        Array.isArray(data) && data.length > 0
          ? data
          : [{ version: form.version || '1', status: form.status || 'DRAFT', createdAt: '2026-10-06' }]
      );
    } catch {
      setVersions([
        { version: form.version || '1', status: form.status || 'DRAFT', createdAt: '2026-10-06' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    if (isOpen && form) {
      fetchVersions();
    }
  }, [isOpen, form, fetchVersions]);

  // Create New Version Draft
  const handleCreateNewVersion = async () => {
    const targetId = form?.id || form?._id || form?.formCode;
    if (!targetId) return;
    setLoading(true);
    setValidationError(null);
    try {
      const newVersionNumber = (parseFloat(form.version || '1') + 0.1).toFixed(1);
      const payload = {
        ...form,
        version: newVersionNumber,
        status: 'DRAFT',
        createdAt: new Date().toISOString()
      };
      await formApi.createVersion(targetId, payload);
      onVersionChange && onVersionChange();
      fetchVersions();
    } catch (err) {
      setValidationError({
        message: err.message || 'Failed to create new version draft.',
        details: err.details || null
      });
      setLoading(false);
    }
  };

  // Inspect Version Schema
  const handleViewVersion = async (verStr) => {
    const targetId = form?.id || form?._id || form?.formCode;
    setLoading(true);
    try {
      const schemaData = await formApi.getVersion(targetId, verStr);
      setSelectedVersionSchema(schemaData || form);
    } catch {
      setSelectedVersionSchema(form);
    } finally {
      setLoading(false);
    }
  };

  // Publish Version - Passes backend validation check
  const handlePublish = async (verStr) => {
    const targetId = form?.id || form?._id || form?.formCode;
    if (!targetId) return;
    setPublishingVer(verStr);
    setValidationError(null);
    try {
      // Direct REST POST /api/forms/{id}/versions/{version}/publish
      await formApi.publishVersion(targetId, verStr);
      setPublishingVer(null);
      onVersionChange && onVersionChange();
      fetchVersions();
    } catch (err) {
      setPublishingVer(null);
      // Capture structured backend validation errors
      setValidationError({
        message: err.message || 'Backend publishing validation failed.',
        details: err.details || [
          err.message || 'Invalid form configuration'
        ]
      });
    }
  };

  if (!isOpen || !form) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Version Control & History: ${form.title}`}
      footerButtons={
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="text-muted fs-7">Form Code: </span>
          <span className="font-monospace fw-bold text-dark">{form.formCode}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={handleCreateNewVersion}
          disabled={loading}
        >
          <i className="bi bi-plus-circle me-1"></i> Create New Version Draft
        </button>
      </div>

      {/* Backend Validation Errors Display */}
      {validationError && (
        <div className="alert alert-danger border-danger p-3 mb-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-shield-x text-danger fs-4"></i>
            <h6 className="alert-heading fw-bold mb-0">Backend Publishing Validation Failed</h6>
          </div>
          <p className="fs-7 mb-2 text-dark fw-medium">{validationError.message}</p>

          {Array.isArray(validationError.details) ? (
            <ul className="mb-0 fs-7 text-danger">
              {validationError.details.map((detail, dIdx) => (
                <li key={dIdx}>{typeof detail === 'object' ? JSON.stringify(detail) : detail}</li>
              ))}
            </ul>
          ) : (
            validationError.details && (
              <pre className="bg-white p-2 rounded border fs-8 text-danger mb-0">
                <code>{JSON.stringify(validationError.details, null, 2)}</code>
              </pre>
            )
          )}
        </div>
      )}

      {loading && <LoadingSpinner message="Fetching version history from API..." />}

      {!loading && (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Version</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Immutability</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v, idx) => {
                const isPublished = v.status === 'PUBLISHED';
                return (
                  <tr key={idx}>
                    <td className="fw-bold font-monospace text-primary">v{v.version}</td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="text-muted fs-7">{v.createdAt || '2026-10-06'}</td>
                    <td>
                      {isPublished ? (
                        <span className="badge bg-secondary-subtle text-secondary border fs-8">
                          <i className="bi bi-lock-fill me-1"></i> Immutable
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning border fs-8">
                          <i className="bi bi-pencil-fill me-1"></i> Mutable Draft
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-info"
                          title="View Version Schema"
                          onClick={() => handleViewVersion(v.version)}
                        >
                          <i className="bi bi-eye"></i> View
                        </button>

                        <Link
                          to={`/preview/${form.id}`}
                          state={{ schema: v }}
                          className="btn btn-outline-dark"
                          title="Preview Version"
                          onClick={onClose}
                        >
                          <i className="bi bi-play-circle"></i> Preview
                        </Link>

                        {!isPublished && (
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            title="Publish Version"
                            onClick={() => handlePublish(v.version)}
                            disabled={publishingVer === v.version}
                          >
                            {publishingVer === v.version ? (
                              <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                              <>
                                <i className="bi bi-cloud-upload me-1"></i> Publish
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Version JSON Schema Inspection Drawer */}
      {selectedVersionSchema && (
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="fw-bold text-dark mb-0">
              Inspecting Version v{selectedVersionSchema.version} Configuration
            </h6>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm py-0 px-2"
              onClick={() => setSelectedVersionSchema(null)}
            >
              Close Inspector
            </button>
          </div>
          <pre className="bg-dark text-light p-3 rounded font-monospace fs-7 overflow-auto" style={{ maxHeight: '250px' }}>
            <code>{JSON.stringify(selectedVersionSchema, null, 2)}</code>
          </pre>
        </div>
      )}
    </Modal>
  );
};

export default VersionHistoryModal;
