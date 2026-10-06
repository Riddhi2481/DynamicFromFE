import React from 'react';

const HeadingField = ({ field }) => {
  if (field?.visible === false) return null;

  return (
    <div className="my-3 pb-2 border-bottom">
      <h4 className="fw-bold text-dark mb-1">{field.fieldLabel || 'Section Heading'}</h4>
      {field.helpText && <p className="text-muted fs-7 mb-0">{field.helpText}</p>}
    </div>
  );
};

export default HeadingField;
