import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FormListPage from '../pages/forms/FormListPage';
import FormCreatePage from '../pages/forms/FormCreatePage';
import FormBuilderPage from '../pages/builder/FormBuilderPage';
import FormPreviewPage from '../pages/preview/FormPreviewPage';
import FormVersionsPage from '../pages/versions/FormVersionsPage';
import FormSubmissionsPage from '../pages/submissions/FormSubmissionsPage';
import PublicSubmissionPage from '../pages/submissions/PublicSubmissionPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/forms" replace />} />
      <Route path="/forms" element={<FormListPage />} />
      <Route path="/forms/create" element={<FormCreatePage />} />
      <Route path="/builder/:formId" element={<FormBuilderPage />} />
      <Route path="/preview/:formId" element={<FormPreviewPage />} />
      <Route path="/versions/:formId" element={<FormVersionsPage />} />
      <Route path="/submissions/:formId" element={<FormSubmissionsPage />} />
      <Route path="/submit/:formCode" element={<PublicSubmissionPage />} />
      <Route path="*" element={<Navigate to="/forms" replace />} />
    </Routes>
  );
};

export default AppRoutes;
