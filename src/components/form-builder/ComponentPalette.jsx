import React from 'react';
import { FIELD_TYPES, FIELD_TYPE_LABELS } from '../../constants/fieldTypes';

const PALETTE_CATEGORIES = [
  {
    title: 'Text & Inputs',
    icon: 'bi-input-cursor-text',
    types: [
      FIELD_TYPES.TEXT,
      FIELD_TYPES.TEXT_AREA,
      FIELD_TYPES.NUMBER,
      FIELD_TYPES.DECIMAL,
      FIELD_TYPES.EMAIL,
      FIELD_TYPES.PHONE
    ]
  },
  {
    title: 'Selection & Choices',
    icon: 'bi-ui-radios-grid',
    types: [
      FIELD_TYPES.DROPDOWN,
      FIELD_TYPES.RADIO,
      FIELD_TYPES.CHECKBOX,
      FIELD_TYPES.MULTI_SELECT,
      FIELD_TYPES.TOGGLE
    ]
  },
  {
    title: 'Date & Rating',
    icon: 'bi-calendar-event',
    types: [
      FIELD_TYPES.DATE,
      FIELD_TYPES.DATE_TIME,
      FIELD_TYPES.FILE_UPLOAD,
      FIELD_TYPES.RATING
    ]
  },
  {
    title: 'Structure & Layout',
    icon: 'bi-layout-three-columns',
    types: [
      FIELD_TYPES.HEADING,
      FIELD_TYPES.SECTION
    ]
  }
];

const ComponentPalette = ({ onAddField }) => {
  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-header bg-white fw-bold py-3 border-bottom d-flex align-items-center justify-content-between">
        <span>
          <i className="bi bi-grid-plus me-2 text-primary"></i> Component Palette
        </span>
        <span className="badge bg-primary-subtle text-primary border border-primary fs-8">17 Types</span>
      </div>
      <div className="card-body p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <p className="text-muted fs-7 mb-3">
          <i className="bi bi-info-circle me-1"></i> Drag onto canvas or click to add:
        </p>

        {PALETTE_CATEGORIES.map((cat, idx) => (
          <div key={idx} className="mb-3">
            <h6 className="fw-bold fs-7 text-uppercase text-secondary mb-2 d-flex align-items-center">
              <i className={`bi ${cat.icon} me-1 text-primary`}></i> {cat.title}
            </h6>
            <div className="d-flex flex-column gap-1">
              {cat.types.map((typeKey) => (
                <div
                  key={typeKey}
                  draggable
                  onDragStart={(e) => handleDragStart(e, typeKey)}
                  className="btn btn-outline-secondary text-start btn-sm py-2 px-3 d-flex align-items-center justify-content-between shadow-2xs hover-shadow cursor-grab"
                  onClick={() => onAddField && onAddField(typeKey)}
                  title={`Add ${FIELD_TYPE_LABELS[typeKey]}`}
                >
                  <span className="d-flex align-items-center gap-2">
                    <i className="bi bi-grip-vertical text-muted"></i>
                    <span className="fw-medium text-dark">{FIELD_TYPE_LABELS[typeKey] || typeKey}</span>
                  </span>
                  <i className="bi bi-plus-circle text-primary opacity-75"></i>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentPalette;
