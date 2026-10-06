import { useState, useCallback } from 'react';
import { formApi } from '../services/formApi';

/**
 * Custom Hook providing reactive states (loading, error) and methods for all 13 Form REST APIs.
 */
export const useFormApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeApi = useCallback(async (apiFn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      setLoading(false);
      return res;
    } catch (err) {
      setError(err.message || 'API Execution failed');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    // Forms
    createForm: (data) => executeApi(formApi.createForm, data),
    getForms: () => executeApi(formApi.getForms),
    getFormById: (id) => executeApi(formApi.getFormById, id),
    updateForm: (id, data) => executeApi(formApi.updateForm, id, data),
    deleteForm: (id) => executeApi(formApi.deleteForm, id),
    // Versions
    getVersions: (id) => executeApi(formApi.getVersions, id),
    createVersion: (id, data) => executeApi(formApi.createVersion, id, data),
    getVersion: (id, version) => executeApi(formApi.getVersion, id, version),
    publishVersion: (id, version) => executeApi(formApi.publishVersion, id, version),
    // Published Form
    getPublishedForm: (formCode) => executeApi(formApi.getPublishedForm, formCode),
    // Submissions
    submitForm: (formCode, payload) => executeApi(formApi.submitForm, formCode, payload),
    getSubmissions: (formCode) => executeApi(formApi.getSubmissions, formCode),
    getSubmissionById: (submissionId) => executeApi(formApi.getSubmissionById, submissionId)
  };
};
