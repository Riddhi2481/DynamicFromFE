import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import Modal from '../../components/common/Modal';
import { formApi } from '../../services/formApi';

const FormSubmissionsPage = () => {
  const { formId } = useParams(); // formId or formCode
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Direct REST Call GET /api/forms/{formCode}/submissions
      const data = await formApi.getSubmissions(formId);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch {
      // Fallback empty list for dev/test
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Inspect Submission Detail GET /api/submissions/{submissionId}
  const handleInspectSubmission = async (subId) => {
    setDetailLoading(true);
    try {
      const detail = await formApi.getSubmissionById(subId);
      setSelectedSubmission(detail || { id: subId });
    } catch {
      setSelectedSubmission({ id: subId });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-0">Form Submissions Record</h3>
          <p className="text-muted fs-7 mb-0">
            Form Code: <span className="font-monospace text-primary fw-bold">{formId}</span> | REST Endpoint: GET /api/forms/{formId}/submissions
          </p>
        </div>
        <Link to="/forms" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i> Dashboard
        </Link>
      </div>

      {loading && <LoadingSpinner message="Fetching user response submissions from REST API..." />}

      {error && <ErrorAlert title="Submissions Error" message={error} onRetry={loadSubmissions} />}

      {!loading && !error && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Submission ID / Ref</th>
                  <th>Submitted At</th>
                  <th>Responses Count</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox display-5 d-block mb-2 text-secondary"></i>
                      No user submissions recorded for this form yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub, idx) => (
                    <tr key={sub.id || idx}>
                      <td className="fw-bold font-monospace text-primary">
                        {sub.id || sub.submissionCode || `SUB-${idx + 1}`}
                      </td>
                      <td className="text-muted fs-7">{sub.submittedAt || 'Recently'}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {Object.keys(sub.responses || sub.values || {}).length} fields
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleInspectSubmission(sub.id || `SUB-${idx + 1}`)}
                        >
                          <i className="bi bi-eye me-1"></i> Inspect Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      <Modal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        title={`Submission Detail: ${selectedSubmission?.id || ''}`}
        footerButtons={
          <button type="button" className="btn btn-secondary" onClick={() => setSelectedSubmission(null)}>
            Close
          </button>
        }
      >
        {detailLoading && <LoadingSpinner message="Fetching submission details..." />}

        {!detailLoading && selectedSubmission && (
          <div>
            <div className="mb-3 p-3 bg-light rounded border fs-7">
              <div><strong>Form Code:</strong> {formId}</div>
              <div><strong>Submission ID:</strong> {selectedSubmission.id}</div>
              <div><strong>Timestamp:</strong> {selectedSubmission.submittedAt || 'N/A'}</div>
            </div>

            <h6 className="fw-bold text-dark mb-2">Submitted Field Responses:</h6>
            <pre className="bg-dark text-light p-3 rounded font-monospace fs-7 overflow-auto" style={{ maxHeight: '300px' }}>
              <code>{JSON.stringify(selectedSubmission.responses || selectedSubmission.values || selectedSubmission, null, 2)}</code>
            </pre>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default FormSubmissionsPage;
