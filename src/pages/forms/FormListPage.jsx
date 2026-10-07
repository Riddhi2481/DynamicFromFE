import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import ToastNotification from '../../components/common/ToastNotification';
import CreateFormModal from '../../components/management/CreateFormModal';
import EditFormModal from '../../components/management/EditFormModal';
import ViewFormModal from '../../components/management/ViewFormModal';
import CloneFormModal from '../../components/management/CloneFormModal';
import VersionHistoryModal from '../../components/management/VersionHistoryModal';
import DeleteFormModal from '../../components/management/DeleteFormModal';
import { formApi } from '../../services/formApi';

const FormListPage = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewForm, setViewForm] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [cloneForm, setCloneForm] = useState(null);
  const [versionForm, setVersionForm] = useState(null);
  const [deleteForm, setDeleteForm] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);

  // Loading states for actions
  const [publishingId, setPublishingId] = useState(null);
  const [archivingId, setArchivingId] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formApi.getForms();
      const rawList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data?.forms)
        ? data.data.forms
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?.forms)
        ? data.forms
        : [];

      const formsList = rawList.map((f) => ({
        ...f,
        id: f.id || f._id || f.formCode || '',
        title: f.title || f.name || 'Untitled Form',
        formCode: f.formCode || f.code || '',
        version: f.version || f.currentDraftVersion || f.publishedVersion || '1',
        status: f.status || (f.publishedVersion ? 'PUBLISHED' : 'DRAFT')
      }));

      setForms(formsList);
    } catch (err) {
      setError(err.message || 'Failed to fetch form definitions from backend API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Publish Action - POST /api/forms/{id}/versions/{version}/publish
  const handlePublishForm = async (formItem) => {
    const targetId = formItem?.id || formItem?._id || formItem?.formCode;
    const targetVersion = formItem?.version || formItem?.currentDraftVersion || formItem?.publishedVersion || '1';

    if (!targetId) {
      showToast('Publish Error', 'Form ID is missing or invalid.', 'danger');
      return;
    }

    if (publishingId || archivingId) return;

    setPublishingId(targetId);
    try {
      await formApi.publishVersion(targetId, targetVersion);
      setForms((prevForms) =>
        prevForms.map((f) =>
          (f.id === targetId || f.formCode === targetId)
            ? { ...f, status: 'PUBLISHED', publishedVersion: targetVersion }
            : f
        )
      );
      showToast('Form Published', `"${formItem.title}" is now published and active.`);
      await loadForms();
    } catch (err) {
      showToast('Publish Error', err.message || 'Could not publish form.', 'danger');
    } finally {
      setPublishingId(null);
    }
  };

  // Archive Action - PUT /api/forms/{id} with status: 'ARCHIVED'
  const handleArchiveForm = async (formItem) => {
    const targetId = formItem?.id || formItem?._id || formItem?.formCode;

    if (!targetId) {
      showToast('Archive Error', 'Form ID is missing or invalid.', 'danger');
      return;
    }

    if (publishingId || archivingId) return;

    setArchivingId(targetId);
    try {
      const updated = { ...formItem, status: 'ARCHIVED' };
      await formApi.updateForm(targetId, updated);
      setForms((prevForms) =>
        prevForms.map((f) =>
          (f.id === targetId || f.formCode === targetId)
            ? { ...f, status: 'ARCHIVED' }
            : f
        )
      );
      showToast('Form Archived', `"${formItem.title}" status set to ARCHIVED.`);
      await loadForms();
    } catch (err) {
      showToast('Archive Error', err.message || 'Could not archive form.', 'danger');
    } finally {
      setArchivingId(null);
    }
  };

  // Filtered List - Safe Array Handling
  const safeFormsList = Array.isArray(forms) ? forms : [];
  const filteredForms = safeFormsList.filter((f) => {
    const title = f.title || f.name || '';
    const code = f.formCode || f.code || '';
    const category = f.category || '';
    const status = f.status || (f.publishedVersion ? 'PUBLISHED' : 'DRAFT');

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Form Management Dashboard</h2>
          <p className="text-muted mb-0">Create, configure, publish, version, and archive dynamic forms</p>
        </div>
        <button className="btn btn-primary shadow-sm px-3 py-2 fw-semibold" onClick={() => setIsCreateOpen(true)}>
          <i className="bi bi-plus-lg me-2"></i> Create New Form
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by title, code, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-7 d-flex justify-content-md-end gap-1">
              {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`btn btn-sm ${statusFilter === st ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="Loading form configurations from API..." />}

      {/* Error State */}
      {error && <ErrorAlert title="API Service Error" message={error} onRetry={loadForms} />}

      {/* Form List Data Table */}
      {!loading && !error && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Form Title &amp; Code</th>
                  <th>Category</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-folder2-open display-6 mb-2 d-block text-secondary"></i>
                      No forms matching criteria. Click &quot;Create New Form&quot; to build a form.
                    </td>
                  </tr>
                ) : (
                  filteredForms.map((f) => (
                    <tr key={f.id || f.formCode}>
                      <td>
                        <div className="fw-bold text-dark">{f.title}</div>
                        <div className="text-muted fs-7 font-monospace">{f.formCode}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border fs-7">
                          {f.category || 'General'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">v{f.version || '1'}</span>
                      </td>
                      <td>
                        <StatusBadge status={f.status} />
                      </td>
                      <td className="text-muted fs-7">{f.updatedAt || 'Recently'}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-info"
                            title="View Metadata"
                            onClick={() => setViewForm(f)}
                          >
                            <i className="bi bi-info-circle"></i>
                          </button>

                          <Link
                            to={`/builder/${f.id || f.formCode}`}
                            className="btn btn-outline-primary"
                            title="Edit Schema Builder"
                          >
                            <i className="bi bi-pencil"></i> Edit
                          </Link>

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            title="Edit Metadata"
                            onClick={() => setEditForm(f)}
                          >
                            <i className="bi bi-gear"></i>
                          </button>

                          <Link
                            to={`/preview/${f.id || f.formCode}`}
                            className="btn btn-outline-dark"
                            title="Preview Form"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            title="Clone Form"
                            onClick={() => setCloneForm(f)}
                          >
                            <i className="bi bi-copy"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            title="Version History"
                            onClick={() => setVersionForm(f)}
                          >
                            <i className="bi bi-clock-history"></i>
                          </button>

                          {f.status === 'DRAFT' && (
                            <button
                              type="button"
                              className="btn btn-outline-success"
                              title="Publish Form"
                              onClick={() => handlePublishForm(f)}
                              disabled={publishingId === (f.id || f.formCode) || archivingId === (f.id || f.formCode)}
                            >
                              {publishingId === (f.id || f.formCode) ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="bi bi-cloud-upload"></i>
                              )}
                            </button>
                          )}

                          {f.status !== 'ARCHIVED' && (
                            <button
                              type="button"
                              className="btn btn-outline-warning"
                              title="Archive Form"
                              onClick={() => handleArchiveForm(f)}
                              disabled={publishingId === (f.id || f.formCode) || archivingId === (f.id || f.formCode)}
                            >
                              {archivingId === (f.id || f.formCode) ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="bi bi-archive"></i>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Delete Form"
                            onClick={() => setDeleteForm(f)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newForm) => {
          showToast('Form Created', `Successfully created "${newForm.title}".`);
          loadForms();
        }}
      />

      <EditFormModal
        isOpen={!!editForm}
        form={editForm}
        onClose={() => setEditForm(null)}
        onSuccess={(updated) => {
          showToast('Form Updated', `Successfully updated "${updated.title}".`);
          loadForms();
        }}
      />

      <ViewFormModal
        isOpen={!!viewForm}
        form={viewForm}
        onClose={() => setViewForm(null)}
      />

      <CloneFormModal
        isOpen={!!cloneForm}
        form={cloneForm}
        onClose={() => setCloneForm(null)}
        onSuccess={(cloned) => {
          showToast('Form Cloned', `Cloned new form "${cloned.title}".`);
          loadForms();
        }}
      />

      <VersionHistoryModal
        isOpen={!!versionForm}
        form={versionForm}
        onClose={() => setVersionForm(null)}
        onVersionChange={() => {
          showToast('Version Updated', 'Form version state updated successfully.');
          loadForms();
        }}
      />

      <DeleteFormModal
        isOpen={!!deleteForm}
        form={deleteForm}
        onClose={() => setDeleteForm(null)}
        onSuccess={() => {
          showToast('Form Deleted', 'Form configuration deleted successfully.', 'info');
          loadForms();
        }}
      />
    </Layout>
  );
};

export default FormListPage;
