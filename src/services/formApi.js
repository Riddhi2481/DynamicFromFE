import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './apiConfig';

/**
 * Dynamic Form Builder REST API Service Layer
 * Strict 1-to-1 parity with Spring Boot Backend Contract
 */

// ==========================================
// FORM MANAGEMENT APIs
// ==========================================

/**
 * POST /api/forms
 * Create a new form configuration draft
 */
export const createForm = async (formData) => {
  return await axiosInstance.post(ENDPOINTS.FORMS, formData);
};

/**
 * GET /api/forms
 * Fetch all form configurations
 */
export const getForms = async () => {
  return await axiosInstance.get(ENDPOINTS.FORMS);
};

/**
 * GET /api/forms/{id}
 * Fetch form configuration by unique ID
 */
export const getFormById = async (id) => {
  return await axiosInstance.get(ENDPOINTS.FORM_BY_ID(id));
};

/**
 * PUT /api/forms/{id}
 * Update existing form configuration
 */
export const updateForm = async (id, formData) => {
  return await axiosInstance.put(ENDPOINTS.FORM_BY_ID(id), formData);
};

/**
 * DELETE /api/forms/{id}
 * Delete a form configuration
 */
export const deleteForm = async (id) => {
  return await axiosInstance.delete(ENDPOINTS.FORM_BY_ID(id));
};

// ==========================================
// VERSION MANAGEMENT APIs
// ==========================================

/**
 * GET /api/forms/{id}/versions
 * Fetch version history for a form
 */
export const getVersions = async (id) => {
  return await axiosInstance.get(ENDPOINTS.VERSIONS(id));
};

/**
 * POST /api/forms/{id}/versions
 * Create a new version for a form
 */
export const createVersion = async (id, versionData = {}) => {
  return await axiosInstance.post(ENDPOINTS.VERSIONS(id), versionData);
};

/**
 * GET /api/forms/{id}/versions/{version}
 * Fetch a specific version definition
 */
export const getVersion = async (id, version) => {
  return await axiosInstance.get(ENDPOINTS.VERSION_BY_ID(id, version));
};

/**
 * POST /api/forms/{id}/versions/{version}/publish
 * Publish a specific version of a form
 */
export const publishVersion = async (id, version) => {
  return await axiosInstance.post(ENDPOINTS.PUBLISH_VERSION(id, version));
};

// ==========================================
// PUBLISHED FORM API
// ==========================================

/**
 * GET /api/forms/{formCode}/published
 * Fetch active published form schema by formCode for end-user rendering
 */
export const getPublishedForm = async (formCode) => {
  return await axiosInstance.get(ENDPOINTS.PUBLISHED_FORM(formCode));
};

// ==========================================
// SUBMISSION APIs
// ==========================================

/**
 * POST /api/forms/{formCode}/submissions
 * Submit end-user form response for a published form
 */
export const submitForm = async (formCode, submissionPayload) => {
  return await axiosInstance.post(ENDPOINTS.SUBMISSIONS(formCode), submissionPayload);
};

/**
 * GET /api/forms/{formCode}/submissions
 * Fetch all submissions for a given form code
 */
export const getSubmissions = async (formCode) => {
  return await axiosInstance.get(ENDPOINTS.SUBMISSIONS(formCode));
};

/**
 * GET /api/submissions/{submissionId}
 * Fetch specific submission details by submission ID
 */
export const getSubmissionById = async (submissionId) => {
  return await axiosInstance.get(ENDPOINTS.SUBMISSION_BY_ID(submissionId));
};

// Unified Default Service Object Export
export const formApi = {
  createForm,
  getForms,
  getFormById,
  updateForm,
  deleteForm,
  getVersions,
  createVersion,
  getVersion,
  publishVersion,
  getPublishedForm,
  submitForm,
  getSubmissions,
  getSubmissionById
};

export default formApi;
