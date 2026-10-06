import React from 'react';

const ConditionGroup = ({ conditionGroup, onRemove }) => {
  return (
    <div className="card shadow-sm border-0 mb-3 bg-light">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="badge bg-primary">
            Match {conditionGroup?.logicOperator || 'AND'} Rules
          </span>
          {onRemove && (
            <button type="button" className="btn btn-outline-danger btn-sm py-0 px-2" onClick={onRemove}>
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
        <div className="text-muted fs-7">
          Rule count: {conditionGroup?.rules?.length || 0} condition(s) configured.
        </div>
      </div>
    </div>
  );
};

export default ConditionGroup;
