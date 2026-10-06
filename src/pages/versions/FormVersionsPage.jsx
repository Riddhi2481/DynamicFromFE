import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import ToastNotification from '../../components/common/ToastNotification';
import Modal from '../../components/common/Modal';
import { formApi } from '../../services/formApi';

const FormVersionsPage = () => {
  const { formId } = useParams();
  const [formMeta, setFormMeta] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [publishingVer, setPublishingVer] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadVersionHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const meta = await formApi.getFormById(formId);
      setFormMeta(meta);

      const data = await formApi.getVersions(formId);
      setVersions(
        Array.isArray(data) && data.length > 0
          ? data
          : [{ version: meta?.version || '1', status: meta?.status || 'DRAFT', createdAt: '2026-10-06' }]
      );
    } catch (err) {
      setError(err.message || 'Failed to fetch version history');
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadVersionHistory();
  }, [loadVersionHistory]);

  // Create Version Draft
  const handleCreateNewVersion = async () => {
    setLoading(true);
    setValidationError(null);
    try {
      const nextVer = (parseFloat(formMeta?.version || '1') + 0.1).toFixed(1);
      const payload = {
        ...formMeta,
        version: nextVer,
        status: 'DRAFT',
        createdAt: new Date().toISOString()
      };
      await formApi.createVersion(formId, payload);
      showToast('Version Created', `Created new draft version v${nextVer}.`);
      loadVersionHistory();
    } catch (err) {
      setValidationError({
        message: err.message || 'Failed to create new version draft',
        details: err.details || null
      });
      setLoading(false);
    }
  };

  // Inspect Version
  const handleInspectVersion = async (verStr) => {
    try {
      const data = await formApi.getVersion(formId, verStr);
      setSelectedSchema(data || formMeta);
    } catch {
      setSelectedSchema(formMeta);
    }
  };

  // Publish Version - Direct REST Call POST /api/forms/{id}/versions/{version}/publish
  const handlePublishVersion = async (verStr) => {
    setPublishingVer(verStr);
    setValidationError(null);
    try {
      await formApi.publishVersion(formId, verStr);
      setPublishingVer(null);
      showToast('Version Published', `Successfully published version v${verStr}.`);
      loadVersionHistory();
    } catch (err) {
      setPublishingVer(null);
      setValidationError({
        message: err.message || 'Backend publishing validation failed.',
        details: err.details || [err.message || 'Validation failure']
      });
    }
  };

  return (
    <Layout>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-0">Form Version Control</h3>
          <p className="text-muted fs-7 mb-0">
            Form: <span className="fw-bold text-dark">{formMeta?.title || formId}</span> | Code:{' '}
            <span className="font-monospace text-primary">{formMeta?.formCode}</span>
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/forms" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> Dashboard
          </Link>
          <button
            type="button"
            className="btn btn-primary fw-semibold"
            onClick={handleCreateNewVersion}
            disabled={loading}
          >
            <i className="bi bi-plus-lg me-1"></i> Create New Version Draft
          </button>
        </div>
      </div>

      {/* Backend Validation Errors Display */}
      {validationError && (
        <div className="alert alert-danger border-danger p-4 mb-4 shadow-sm">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-shield-x text-danger fs-3"></i>
            <div>
              <h5 className="alert-heading fw-bold mb-0">Backend Publishing Validation Failed</h5>
              <p className="mb-0 fs-7">{validationError.message}</p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-top border-danger-subtle">
            <h6 className="fw-bold fs-7 text-danger">Validation Issues Detected by Backend Engine:</h6>
            {Array.isArray(validationError.details) ? (
              <ul className="mb-0 fs-7 text-danger">
                {validationError.details.map((item, idx) => (
                  <li key={idx}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                ))}
              </ul>
            ) : (
              validationError.details && (
                <pre className="bg-white p-3 rounded border fs-7 text-danger mb-0">
                  <code>{JSON.stringify(validationError.details, null, 2)}</code>
                </pre>
              )
            )}
          </div>
        </div>
      )}

      {loading && <LoadingSpinner message="Fetching form versions from REST API..." />}

      {error && <ErrorAlert title="Version Control Error" message={error} onRetry={loadVersionHistory} />}

      {!loading && !error && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Immutability Guarantee</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v, idx) => {
                  const isPublished = v.status === 'PUBLISHED';
                  return (
                    <tr key={idx}>
                      <td className="fw-bold font-monospace text-primary fs-6">v{v.version}</td>
                      <td>
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="text-muted fs-7">{v.createdAt || '2026-10-06'}</td>
                      <td>
                        {isPublished ? (
                          <span className="badge bg-secondary-subtle text-secondary border">
                            <i className="bi bi-lock-fill me-1"></i> Immutable
                          </span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning border">
                            <i className="bi bi-pencil-fill me-1"></i> Mutable Draft
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-info"
                            title="Inspect Schema"
                            onClick={() => handleInspectVersion(v.version)}
                          >
                            <i className="bi bi-code-slash me-1"></i> View
                          </button>

                          <Link
                            to={`/preview/${formId}`}
                            state={{ schema: v }}
                            className="btn btn-outline-dark"
                            title="Preview Version"
                          >
                            <i className="bi bi-eye me-1"></i> Preview
                          </Link>

                          {!isPublished && (
                            <button
                              type="button"
                              className="btn btn-outline-success"
                              onClick={() => handlePublishVersion(v.version)}
                              disabled={publishingVer === v.version}
                            >
                              {publishingVer === v.version ? (
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                              ) : (
                                <>
                                  <i className="bi bi-cloud-upload me-1"></i> Publish Version
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
        </div>
      )}

      {/* Schema Drawer */}
      <Modal
        isOpen={!!selectedSchema}
        onClose={() => setSelectedSchema(null)}
        title={`Schema Configuration: v${selectedSchema?.version}`}
        footerButtons={
          <button type="button" className="btn btn-secondary" onClick={() => setSelectedSchema(null)}>
            Close
          </button>
        }
      >
        <pre className="bg-dark text-light p-3 rounded font-monospace fs-7 overflow-auto" style={{ maxHeight: '350px' }}>
          <code>{JSON.stringify(selectedSchema, null, 2)}</code>
        </pre>
      </Modal>
    </Layout>
  );
};

export default FormVersionsPage;
