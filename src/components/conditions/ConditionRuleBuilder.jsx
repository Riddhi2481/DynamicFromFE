import React, { useState } from 'react';
import { OPERATORS, OPERATOR_LABELS } from '../../constants/operators';
import { CONDITIONAL_ACTIONS, ACTION_LABELS } from '../../constants/actions';

const ConditionRuleBuilder = ({ fields = [], conditions = [], onUpdateConditions }) => {
  const [newCondition, setNewCondition] = useState({
    logicOperator: 'AND',
    targetFieldCode: fields[0]?.fieldCode || '',
    action: CONDITIONAL_ACTIONS.SHOW,
    rules: [
      {
        sourceFieldCode: fields[0]?.fieldCode || '',
        operator: OPERATORS.EQUALS,
        targetValue: ''
      }
    ]
  });

  const handleAddRuleRow = () => {
    setNewCondition({
      ...newCondition,
      rules: [
        ...newCondition.rules,
        {
          sourceFieldCode: fields[0]?.fieldCode || '',
          operator: OPERATORS.EQUALS,
          targetValue: ''
        }
      ]
    });
  };

  const handleRemoveRuleRow = (idx) => {
    const updated = newCondition.rules.filter((_, i) => i !== idx);
    setNewCondition({ ...newCondition, rules: updated });
  };

  const handleRuleChange = (idx, key, value) => {
    const updated = [...newCondition.rules];
    updated[idx] = { ...updated[idx], [key]: value };
    setNewCondition({ ...newCondition, rules: updated });
  };

  const handleSaveConditionGroup = () => {
    if (!newCondition.targetFieldCode || newCondition.rules.length === 0) return;

    const nextConditions = [...conditions, { ...newCondition, id: `cond_${Date.now()}` }];
    onUpdateConditions && onUpdateConditions(nextConditions);

    // Reset form
    setNewCondition({
      logicOperator: 'AND',
      targetFieldCode: fields[0]?.fieldCode || '',
      action: CONDITIONAL_ACTIONS.SHOW,
      rules: [
        {
          sourceFieldCode: fields[0]?.fieldCode || '',
          operator: OPERATORS.EQUALS,
          targetValue: ''
        }
      ]
    });
  };

  const handleRemoveCondition = (index) => {
    const nextConditions = conditions.filter((_, i) => i !== index);
    onUpdateConditions && onUpdateConditions(nextConditions);
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
        <h6 className="fw-bold mb-0 text-dark">
          <i className="bi bi-[#d63384] bi-diagram-3 me-2 text-primary"></i> Conditional Logic Rule Builder
        </h6>
        <span className="badge bg-primary-subtle text-primary border border-primary fs-8">
          {conditions.length} Configured
        </span>
      </div>

      <div className="card-body p-3">
        {/* Existing Configured Conditions List */}
        {conditions.length > 0 && (
          <div className="mb-4">
            <h6 className="fw-bold fs-7 text-secondary text-uppercase mb-2">Active Logic Conditions</h6>
            <div className="d-flex flex-column gap-2">
              {conditions.map((cond, cIdx) => (
                <div key={cond.id || cIdx} className="p-3 bg-light rounded border d-flex align-items-center justify-content-between">
                  <div>
                    <span className="badge bg-dark me-2">IF ({cond.logicOperator})</span>
                    {cond.rules?.map((r, rIdx) => (
                      <span key={rIdx} className="fs-7 font-monospace me-2 text-dark">
                        <code>{r.sourceFieldCode}</code> {r.operator} &quot;{r.targetValue}&quot;
                        {rIdx < cond.rules.length - 1 ? ` ${cond.logicOperator} ` : ''}
                      </span>
                    ))}
                    <i className="bi bi-arrow-right mx-2 text-primary"></i>
                    <span className="badge bg-primary me-2">{ACTION_LABELS[cond.action] || cond.action}</span>
                    <span className="fs-7 font-monospace fw-bold text-dark">{cond.targetFieldCode}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm py-0 px-2 fs-7"
                    onClick={() => handleRemoveCondition(cIdx)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Condition Builder Controls */}
        <div className="p-3 bg-light rounded border">
          <h6 className="fw-bold fs-7 mb-3 text-dark">Configure New Dynamic Rule</h6>

          <div className="row g-2 mb-3">
            <div className="col-md-3">
              <label className="form-label fs-7 fw-semibold">Logic Combination</label>
              <select
                className="form-select form-select-sm"
                value={newCondition.logicOperator}
                onChange={(e) => setNewCondition({ ...newCondition, logicOperator: e.target.value })}
              >
                <option value="AND">AND (All rules match)</option>
                <option value="OR">OR (Any rule matches)</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fs-7 fw-semibold">Target Action</label>
              <select
                className="form-select form-select-sm"
                value={newCondition.action}
                onChange={(e) => setNewCondition({ ...newCondition, action: e.target.value })}
              >
                {Object.keys(CONDITIONAL_ACTIONS).map((act) => (
                  <option key={act} value={act}>
                    {ACTION_LABELS[act] || act}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-5">
              <label className="form-label fs-7 fw-semibold">Target Affected Field</label>
              <select
                className="form-select form-select-sm font-monospace"
                value={newCondition.targetFieldCode}
                onChange={(e) => setNewCondition({ ...newCondition, targetFieldCode: e.target.value })}
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.fieldCode}>
                    {f.fieldLabel} ({f.fieldCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="form-label fs-7 fw-semibold mb-2">Source Evaluation Rules</label>
          <div className="d-flex flex-column gap-2 mb-3">
            {newCondition.rules.map((rule, rIdx) => (
              <div key={rIdx} className="input-group input-group-sm">
                <select
                  className="form-select font-monospace"
                  value={rule.sourceFieldCode}
                  onChange={(e) => handleRuleChange(rIdx, 'sourceFieldCode', e.target.value)}
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.fieldCode}>
                      {f.fieldLabel} ({f.fieldCode})
                    </option>
                  ))}
                </select>

                <select
                  className="form-select"
                  value={rule.operator}
                  onChange={(e) => handleRuleChange(rIdx, 'operator', e.target.value)}
                >
                  {Object.keys(OPERATORS).map((op) => (
                    <option key={op} value={op}>
                      {OPERATOR_LABELS[op] || op}
                    </option>
                  ))}
                </select>

                {rule.operator !== OPERATORS.IS_EMPTY && rule.operator !== OPERATORS.IS_NOT_EMPTY && (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Comparison Value"
                    value={rule.targetValue}
                    onChange={(e) => handleRuleChange(rIdx, 'targetValue', e.target.value)}
                  />
                )}

                {newCondition.rules.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => handleRemoveRuleRow(rIdx)}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleAddRuleRow}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Rule Condition
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm fw-semibold"
              onClick={handleSaveConditionGroup}
              disabled={!newCondition.targetFieldCode}
            >
              <i className="bi bi-check-lg me-1"></i> Save Condition Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionRuleBuilder;
