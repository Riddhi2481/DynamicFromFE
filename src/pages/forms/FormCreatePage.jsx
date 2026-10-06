import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import ErrorAlert from '../../components/common/ErrorAlert';
import { formApi } from '../../services/formApi';

const CATEGORIES = [
  'General',
  'HR & Onboarding',
  'Customer Support',
  'Sales & Marketing',
  'Finance & Operations',
  'IT & Security'
];

const FormCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    formCode: '',
    description: '',
    category: 'General'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Form Name is required.';
    if (!formData.formCode.trim()) errs.formCode = 'Form Code is required.';
    else if (!/^[A-Z0-9_-]+$/.test(formData.formCode)) {
      errs.formCode = 'Form Code must contain uppercase letters, numbers, underscores or hyphens only.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setLoading(true);
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

      const created = await formApi.createForm(payload);
      const createdForm = created?.data?.form || created?.data || created || payload;
      const targetId = createdForm?.id || createdForm?.formCode || payload.formCode;
      setLoading(false);
      navigate(`/builder/${targetId}`, { state: { initialForm: { ...payload, ...createdForm } } });
    } catch (err) {
      setLoading(false);
      setApiError(err.message || 'Failed to create form via API endpoint.');
    }
  };

  return (
    <Layout>
      <div className="row justify-content-center">
        <div className="col-lg-7 col-md-9">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
              <h4 className="card-title fw-bold mb-0 text-dark">Create New Dynamic Form</h4>
              <span className="badge bg-warning text-dark">Initial Status: DRAFT (v1)</span>
            </div>
            <div className="card-body p-4">
              {apiError && <ErrorAlert title="Form Creation Error" message={apiError} />}

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
                    <div className="form-text fs-7">Unique alphanumeric identifier for REST endpoint bindings.</div>
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

                <div className="mb-4">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe the purpose of this form..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2 border-top pt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/forms')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-semibold" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Initializing Form...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-right-circle me-1"></i> Save &amp; Continue to Builder
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FormCreatePage;
