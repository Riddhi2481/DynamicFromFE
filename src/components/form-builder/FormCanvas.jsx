import React from 'react';
import { getComponentForType } from '../dynamic-renderer/ComponentRegistry';
import { validateComponentConfig } from '../../utils/validationUtils';

const FormCanvas = ({
  fields = [],
  selectedFieldId,
  onSelectField,
  onRemoveField,
  onDuplicateField,
  onMoveField,
  onDropNewField
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const payload = JSON.parse(dataStr);
        if (payload.type && onDropNewField) {
          onDropNewField(payload.type);
        }
      }
    } catch {
      // Ignore parse error
    }
  };

  return (
    <div
      className="card shadow-sm border-0 min-vh-75"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ backgroundColor: '#fafafa' }}
    >
      <div className="card-header bg-white fw-bold py-3 border-bottom d-flex align-items-center justify-content-between">
        <span>
          <i className="bi bi-kanban me-2 text-primary"></i> Form Canvas
        </span>
        <span className="badge bg-secondary-subtle text-secondary fs-7">
          {fields.length} {fields.length === 1 ? 'Component' : 'Components'}
        </span>
      </div>

      <div className="card-body p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {fields.length === 0 ? (
          <div className="border-dashed p-5 text-center my-4 bg-white rounded">
            <i className="bi bi-cloud-arrow-down display-4 text-primary opacity-50 mb-3 d-block"></i>
            <h5 className="fw-bold text-dark mb-1">Canvas is Empty</h5>
            <p className="text-muted fs-7 mb-0">
              Drag components from the Palette or click any component to add it here.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {fields.map((field, idx) => {
              const isSelected = field.id === selectedFieldId;
              const Component = getComponentForType(field.type);
              const fieldConfigErrors = validateComponentConfig(field, fields);
              const hasErrors = Object.keys(fieldConfigErrors).length > 0;

              return (
                <div
                  key={field.id}
                  className={`card shadow-sm transition-all position-relative ${
                    isSelected ? 'border-primary ring-primary bg-white' : hasErrors ? 'border-danger bg-white' : 'border-light bg-white'
                  }`}
                  onClick={() => onSelectField && onSelectField(field.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Canvas Item Control Bar */}
                  <div className="card-header bg-light py-2 px-3 d-flex align-items-center justify-content-between border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-dark text-white font-monospace fs-8">
                        #{field.displayOrder || idx + 1}
                      </span>
                      <span className="fw-bold text-dark fs-7">{field.fieldLabel || 'Untitled'}</span>
                      <span className="badge bg-secondary-subtle text-secondary font-monospace fs-8">
                        {field.fieldCode}
                      </span>
                      {hasErrors && (
                        <span className="badge bg-danger text-white fs-8" title="Invalid Inspector configuration">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i>Invalid Config
                        </span>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-1">
                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm py-0 px-2 fs-7"
                        disabled={idx === 0}
                        title="Move Up"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveField && onMoveField(idx, idx - 1);
                        }}
                      >
                        <i className="bi bi-arrow-up"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm py-0 px-2 fs-7"
                        disabled={idx === fields.length - 1}
                        title="Move Down"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveField && onMoveField(idx, idx + 1);
                        }}
                      >
                        <i className="bi bi-arrow-down"></i>
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        className="btn btn-outline-info btn-sm py-0 px-2 fs-7 ms-1"
                        title="Duplicate Component"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateField && onDuplicateField(field.id);
                        }}
                      >
                        <i className="bi bi-copy"></i>
                      </button>

                      {/* Remove */}
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm py-0 px-2 fs-7 ms-1"
                        title="Delete Component"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveField && onRemoveField(field.id);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  {/* Component Preview Body */}
                  <div className="card-body p-3 pointer-events-none opacity-90">
                    <Component field={field} value="" readOnly />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormCanvas;
