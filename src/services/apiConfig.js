import { API_BASE_URL } from '../utils/constants';

export const API_CONFIG = {
  baseURL: API_BASE_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const ENDPOINTS = {
  // Form APIs
  FORMS: '/api/forms',
  FORM_BY_ID: (id) => `/api/forms/${id}`,
  
  // Version APIs
  VERSIONS: (id) => `/api/forms/${id}/versions`,
  VERSION_BY_ID: (id, version) => `/api/forms/${id}/versions/${version}`,
  PUBLISH_VERSION: (id, version) => `/api/forms/${id}/versions/${version}/publish`,
  
  // Published Form API
  PUBLISHED_FORM: (formCode) => `/api/forms/${formCode}/published`,
  
  // Submission APIs
  SUBMISSIONS: (formCode) => `/api/forms/${formCode}/submissions`,
  SUBMISSION_BY_ID: (submissionId) => `/api/submissions/${submissionId}`
};
