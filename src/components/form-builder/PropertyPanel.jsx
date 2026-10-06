import React from 'react';
import { FIELD_TYPES } from '../../constants/fieldTypes';
import { validateComponentConfig } from '../../utils/validationUtils';

const PropertyPanel = ({ field, onUpdateField, allFields = [] }) => {
  if (!field) {
    return (
      <div className="card shadow-sm border-0 h-100">
        <div className="card-header bg-white fw-bold py-3 border-bottom">
          <i className="bi bi-sliders me-2 text-primary"></i> Properties Panel
        </div>
        <div className="card-body p-4 text-center text-muted">
          <i className="bi bi-cursor text-secondary display-6 mb-2 d-block"></i>
          <p className="fs-7 mb-0">Select a component on the canvas to configure its properties.</p>
        </div>
      </div>
    );
  }

  const errors = validateComponentConfig(field, allFields);

  const handlePropChange = (key, value) => {
    onUpdateField && onUpdateField(field.id, { [key]: value });
  };

  const isChoiceType =
    field.type === FIELD_TYPES.DROPDOWN ||
    field.type === FIELD_TYPES.RADIO ||
    field.type === FIELD_TYPES.CHECKBOX ||
    field.type === FIELD_TYPES.MULTI_SELECT;

  // Option Handlers
  const handleAddOption = () => {
    const currentOptions = field.options || [];
    const count = currentOptions.length + 1;
    const newOptions = [...currentOptions, { label: `Option ${count}`, value: `option_${count}` }];
    handlePropChange('options', newOptions);
  };

  const handleUpdateOption = (index, key, val) => {
    const currentOptions = [...(field.options || [])];
    currentOptions[index] = { ...currentOptions[index], [key]: val };
    handlePropChange('options', currentOptions);
  };

  const handleRemoveOption = (index) => {
    const currentOptions = (field.options || []).filter((_, idx) => idx !== index);
    handlePropChange('options', currentOptions);
  };

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-header bg-white fw-bold py-3 border-bottom d-flex align-items-center justify-content-between">
        <span>
          <i className="bi bi-sliders me-2 text-primary"></i> Inspector
        </span>
        <span className="badge bg-primary text-white font-monospace fs-8">{field.type}</span>
      </div>

      <div className="card-body p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Core Properties */}
        <div className="mb-3">
          <label className="form-label fs-7 fw-semibold">Field Code</label>
          <input
            type="text"
            className={`form-control form-control-sm font-monospace ${errors.fieldCode ? 'is-invalid' : ''}`}
            value={field.fieldCode || ''}
            onChange={(e) => handlePropChange('fieldCode', e.target.value)}
          />
          {errors.fieldCode ? (
            <div className="invalid-feedback d-block fs-8">{errors.fieldCode}</div>
          ) : (
            <div className="form-text fs-8">Unique key stored in JSON response payload.</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label fs-7 fw-semibold">Field Label</label>
          <input
            type="text"
            className={`form-control form-control-sm ${errors.fieldLabel ? 'is-invalid' : ''}`}
            value={field.fieldLabel || ''}
            onChange={(e) => handlePropChange('fieldLabel', e.target.value)}
          />
          {errors.fieldLabel && <div className="invalid-feedback d-block fs-8">{errors.fieldLabel}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fs-7 fw-semibold">Placeholder Text</label>
          <input
            type="text"
            className={`form-control form-control-sm ${errors.placeholder ? 'is-invalid' : ''}`}
            value={field.placeholder || ''}
            onChange={(e) => handlePropChange('placeholder', e.target.value)}
          />
          {errors.placeholder && <div className="invalid-feedback d-block fs-8">{errors.placeholder}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fs-7 fw-semibold">Help Text / Description</label>
          <input
            type="text"
            className={`form-control form-control-sm ${errors.helpText ? 'is-invalid' : ''}`}
            value={field.helpText || ''}
            onChange={(e) => handlePropChange('helpText', e.target.value)}
          />
          {errors.helpText && <div className="invalid-feedback d-block fs-8">{errors.helpText}</div>}
        </div>

        {field.type !== FIELD_TYPES.HEADING && field.type !== FIELD_TYPES.SECTION && (
          <div className="mb-3">
            <label className="form-label fs-7 fw-semibold">Default Value</label>
            <input
              type="text"
              className={`form-control form-control-sm ${errors.defaultValue ? 'is-invalid' : ''}`}
              value={field.defaultValue !== undefined && field.defaultValue !== null ? field.defaultValue : ''}
              onChange={(e) => handlePropChange('defaultValue', e.target.value)}
            />
            {errors.defaultValue && <div className="invalid-feedback d-block fs-8">{errors.defaultValue}</div>}
          </div>
        )}

        <div className="mb-3">
          <label className="form-label fs-7 fw-semibold">Display Order</label>
          <input
            type="text"
            className={`form-control form-control-sm ${errors.displayOrder ? 'is-invalid' : ''}`}
            value={field.displayOrder !== undefined ? field.displayOrder : 1}
            onChange={(e) => handlePropChange('displayOrder', e.target.value)}
          />
          {errors.displayOrder && <div className="invalid-feedback d-block fs-8">{errors.displayOrder}</div>}
        </div>

        {/* Component-Specific Advanced Controls */}
        {(field.type === FIELD_TYPES.NUMBER || field.type === FIELD_TYPES.DECIMAL || field.type === FIELD_TYPES.RATING) && (
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label fs-7 fw-semibold">Min Value</label>
              <input
                type="text"
                className={`form-control form-control-sm ${errors.min ? 'is-invalid' : ''}`}
                value={field.min !== undefined && field.min !== null ? field.min : ''}
                onChange={(e) => handlePropChange('min', e.target.value)}
              />
              {errors.min && <div className="invalid-feedback d-block fs-8">{errors.min}</div>}
            </div>
            <div className="col-6">
              <label className="form-label fs-7 fw-semibold">Max Value</label>
              <input
                type="text"
                className={`form-control form-control-sm ${errors.max ? 'is-invalid' : ''}`}
                value={field.max !== undefined && field.max !== null ? field.max : ''}
                onChange={(e) => handlePropChange('max', e.target.value)}
              />
              {errors.max && <div className="invalid-feedback d-block fs-8">{errors.max}</div>}
            </div>
          </div>
        )}

        {(field.type === FIELD_TYPES.TEXT || field.type === FIELD_TYPES.TEXT_AREA) && (
          <>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label fs-7 fw-semibold">Min Length</label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${errors.minLength ? 'is-invalid' : ''}`}
                  value={field.minLength !== undefined && field.minLength !== null ? field.minLength : ''}
                  onChange={(e) => handlePropChange('minLength', e.target.value)}
                />
                {errors.minLength && <div className="invalid-feedback d-block fs-8">{errors.minLength}</div>}
              </div>
              <div className="col-6">
                <label className="form-label fs-7 fw-semibold">Max Length</label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${errors.maxLength ? 'is-invalid' : ''}`}
                  value={field.maxLength !== undefined && field.maxLength !== null ? field.maxLength : ''}
                  onChange={(e) => handlePropChange('maxLength', e.target.value)}
                />
                {errors.maxLength && <div className="invalid-feedback d-block fs-8">{errors.maxLength}</div>}
              </div>
            </div>
            {field.type === FIELD_TYPES.TEXT && (
              <div className="mb-3">
                <label className="form-label fs-7 fw-semibold">Regex Pattern</label>
                <input
                  type="text"
                  className={`form-control form-control-sm font-monospace ${errors.regexPattern ? 'is-invalid' : ''}`}
                  value={field.regexPattern || field.regex || ''}
                  onChange={(e) => handlePropChange('regexPattern', e.target.value)}
                  placeholder="e.g. ^[A-Z]+$"
                />
                {errors.regexPattern && <div className="invalid-feedback d-block fs-8">{errors.regexPattern}</div>}
              </div>
            )}
          </>
        )}

        {(field.type === FIELD_TYPES.DATE || field.type === FIELD_TYPES.DATE_TIME) && (
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label fs-7 fw-semibold">Min Date</label>
              <input
                type="date"
                className={`form-control form-control-sm ${errors.minDate ? 'is-invalid' : ''}`}
                value={field.minDate || field.minimumDate || ''}
                onChange={(e) => handlePropChange('minDate', e.target.value)}
              />
              {errors.minDate && <div className="invalid-feedback d-block fs-8">{errors.minDate}</div>}
            </div>
            <div className="col-6">
              <label className="form-label fs-7 fw-semibold">Max Date</label>
              <input
                type="date"
                className={`form-control form-control-sm ${errors.maxDate ? 'is-invalid' : ''}`}
                value={field.maxDate || field.maximumDate || ''}
                onChange={(e) => handlePropChange('maxDate', e.target.value)}
              />
              {errors.maxDate && <div className="invalid-feedback d-block fs-8">{errors.maxDate}</div>}
            </div>
          </div>
        )}

        {field.type === FIELD_TYPES.FILE_UPLOAD && (
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label fs-7 fw-semibold">Max Size (MB)</label>
              <input
                type="text"
                className={`form-control form-control-sm ${errors.maxFileSizeMb ? 'is-invalid' : ''}`}
                value={field.maxFileSizeMb !== undefined && field.maxFileSizeMb !== null ? field.maxFileSizeMb : ''}
                onChange={(e) => handlePropChange('maxFileSizeMb', e.target.value)}
              />
              {errors.maxFileSizeMb && <div className="invalid-feedback d-block fs-8">{errors.maxFileSizeMb}</div>}
            </div>
            <div className="col-6">
              <label className="form-label fs-7 fw-semibold">Min Size (MB)</label>
              <input
                type="text"
                className={`form-control form-control-sm ${errors.minFileSizeMb ? 'is-invalid' : ''}`}
                value={field.minFileSizeMb !== undefined && field.minFileSizeMb !== null ? field.minFileSizeMb : ''}
                onChange={(e) => handlePropChange('minFileSizeMb', e.target.value)}
              />
              {errors.minFileSizeMb && <div className="invalid-feedback d-block fs-8">{errors.minFileSizeMb}</div>}
            </div>
          </div>
        )}

        <hr className="my-3 text-muted" />

        {/* Choice Component Options Editor */}
        {isChoiceType && (
          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <label className="form-label fs-7 fw-bold text-dark mb-0">Options Configurator</label>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm py-0 px-2 fs-7"
                onClick={handleAddOption}
              >
                <i className="bi bi-plus-lg me-1"></i> Add Option
              </button>
            </div>
            <div className="d-flex flex-column gap-2">
              {(field.options || []).map((opt, idx) => (
                <div key={idx} className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Label"
                    value={opt.label || opt.optionLabel || ''}
                    onChange={(e) => handleUpdateOption(idx, 'label', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="Value"
                    value={opt.value || opt.optionValue || ''}
                    onChange={(e) => handleUpdateOption(idx, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => handleRemoveOption(idx)}
                    disabled={(field.options || []).length <= 1}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              ))}
            </div>
            {errors.options && <div className="invalid-feedback d-block fs-8 mt-1">{errors.options}</div>}
          </div>
        )}

        {/* Behavior Toggles */}
        <h6 className="fw-bold fs-7 text-uppercase text-secondary mt-3 mb-2">Behavior Flags</h6>

        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="reqFlag"
            checked={!!field.required}
            onChange={(e) => handlePropChange('required', e.target.checked)}
          />
          <label className="form-check-label fs-7 fw-semibold" htmlFor="reqFlag">
            Required
          </label>
        </div>

        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="disFlag"
            checked={!!field.disabled}
            onChange={(e) => handlePropChange('disabled', e.target.checked)}
          />
          <label className="form-check-label fs-7 fw-semibold" htmlFor="disFlag">
            Disabled
          </label>
        </div>

        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="readOnlyFlag"
            checked={!!field.readOnly}
            onChange={(e) => handlePropChange('readOnly', e.target.checked)}
          />
          <label className="form-check-label fs-7 fw-semibold" htmlFor="readOnlyFlag">
            Read Only
          </label>
        </div>

        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="visFlag"
            checked={field.visible !== false}
            onChange={(e) => handlePropChange('visible', e.target.checked)}
          />
          <label className="form-check-label fs-7 fw-semibold" htmlFor="visFlag">
            Visible by Default
          </label>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
