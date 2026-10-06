import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import DynamicFormRenderer from '../../components/dynamic-renderer/DynamicFormRenderer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useDynamicForm } from '../../hooks/useDynamicForm';
import { formApi } from '../../services/formApi';

/**
 * End-User Published Form Submission Engine
 * Enforces client pre-validation, payload formatting, HTTP error handling (400, 404, 409, 422, 500, network),
 * user input preservation, and confirmation receipt rendering.
 */
const PublicSubmissionPage = () => {
  const { formCode } = useParams();

  const [schema, setSchema] = useState({ fields: [], conditions: [] });
  const [formMeta, setFormMeta] = useState({ title: 'Published Form', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionRef, setSubmissionRef] = useState(null);

  const { values, errors, setErrors, fieldStates, handleChange, handleBlur, validateAll } = useDynamicForm(schema);

  const loadPublishedSchema = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Direct REST GET /api/forms/{formCode}/published
      const data = await formApi.getPublishedForm(formCode);

      if (!data || (data.status && data.status !== 'PUBLISHED' && !data.fields)) {
        throw {
          status: 404,
          message: `No active published version exists for form code "${formCode}".`
        };
      }

      setFormMeta({
        title: data.title || 'Published Form',
        description: data.description || ''
      });

      setSchema({
        fields: data.fields || [],
        conditions: data.conditions || []
      });
    } catch (err) {
      setLoadError({
        status: err.status || 500,
        message: err.message || `No published form found for code "${formCode}".`
      });
    } finally {
      setLoading(false);
    }
  }, [formCode]);

  useEffect(() => {
    loadPublishedSchema();
  }, [loadPublishedSchema]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // 1. Run client-side pre-submission validation (required, visible, component rules)
    if (!validateAll()) {
      return;
    }

    setSubmitting(true);

    try {
      // 2. Build submission payload
      const submissionPayload = {
        formCode: formCode,
        submittedAt: new Date().toISOString(),
        responses: values,
        values: values
      };

      // 3. Send REST request: POST /api/forms/{formCode}/submissions
      const result = await formApi.submitForm(formCode, submissionPayload);

      setSubmitting(false);
      setSubmissionRef(
        result?.submissionId || result?.id || result?.submissionCode || `SUB-${Date.now().toString().slice(-6)}`
      );
      setSubmitted(true);
    } catch (err) {
      setSubmitting(false);

      // Handle specific HTTP Status Codes cleanly WITHOUT losing user entered values!
      const status = err.status || 500;
      let errorMsg = 'An unexpected error occurred during submission.';

      if (status === 400) {
        errorMsg = err.message || '400 Bad Request: Invalid submission payload formatting.';
      } else if (status === 404) {
        errorMsg = err.message || '404 Not Found: Submission endpoint or form code unavailable.';
      } else if (status === 409) {
        errorMsg = err.message || '409 Conflict: Duplicate submission entry detected.';
      } else if (status === 422) {
        // Backend validation errors - map details back to field errors if provided
        errorMsg = err.message || '422 Unprocessable Entity: Backend validation failed.';
        if (err.details && typeof err.details === 'object') {
          setErrors((prev) => ({ ...prev, ...err.details }));
        }
      } else if (status === 500) {
        errorMsg = err.message || '500 Internal Server Error: The server encountered an error processing your response.';
      } else {
        errorMsg = err.message || 'Network Error: Failed to reach backend server. Please check your connection.';
      }

      setSubmitError({ status, message: errorMsg });
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">

            {/* Loading Spinner */}
            {loading && <LoadingSpinner message="Fetching published form configuration..." />}

            {/* 404 / Schema Load Failure Error Card */}
            {!loading && loadError && (
              <div className="card shadow-lg border-0 border-top border-4 border-danger">
                <div className="card-body p-5 text-center">
                  <i className="bi bi-file-earmark-x text-danger display-3 mb-3 d-block"></i>
                  <h3 className="fw-bold text-dark mb-2">Form Not Available</h3>
                  <p className="text-muted fs-6 mb-4">{loadError.message}</p>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={loadPublishedSchema}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i> Retry Loading
                  </button>
                </div>
              </div>
            )}

            {/* Form Entry & Submission View */}
            {!loading && !loadError && (
              <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white py-3 px-4">
                  <h4 className="card-title fw-bold mb-1">{formMeta.title}</h4>
                  {formMeta.description ? (
                    <p className="small mb-0 text-white-50">{formMeta.description}</p>
                  ) : (
                    <p className="small mb-0 text-white-50">Form Code: {formCode}</p>
                  )}
                </div>

                <div className="card-body p-4">
                  {submitted ? (
                    /* Submission Confirmation View */
                    <div className="text-center py-5">
                      <i className="bi bi-check-circle-fill text-success display-3 mb-3 d-block"></i>
                      <h4 className="fw-bold text-dark mb-2">Response Submitted Successfully</h4>
                      <p className="text-muted fs-7 mb-4">
                        Submission Reference Code:{' '}
                        <strong className="font-monospace text-primary bg-light px-3 py-1 border rounded fs-6">
                          {submissionRef}
                        </strong>
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary px-4 shadow-sm"
                        onClick={() => window.location.reload()}
                      >
                        <i className="bi bi-plus-lg me-1"></i> Submit Another Response
                      </button>
                    </div>
                  ) : (
                    /* Dynamic Form Input Form */
                    <form onSubmit={handleSubmit}>
                      {submitError && (
                        <ErrorAlert
                          title={`Submission Failure (${submitError.status})`}
                          message={submitError.message}
                        />
                      )}

                      <DynamicFormRenderer
                        schema={schema}
                        values={values}
                        errors={errors}
                        fieldStates={fieldStates}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />

                      <div className="mt-4 pt-3 border-top">
                        <button
                          type="submit"
                          className="btn btn-primary w-100 py-2.5 fw-bold shadow-sm"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Submitting Response...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send-check me-2"></i> Submit Response
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSubmissionPage;
