import React from 'react';

const FormBuilderLayout = ({ palette, canvas, propertyPanel }) => {
  return (
    <div className="row g-3">
      <div className="col-lg-3 col-md-4">{palette}</div>
      <div className="col-lg-6 col-md-8">{canvas}</div>
      <div className="col-lg-3 col-md-12">{propertyPanel}</div>
    </div>
  );
};

export default FormBuilderLayout;
