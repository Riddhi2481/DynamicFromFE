import React from 'react';
import { STATUS_COLORS } from '../../constants/formStatuses';

const StatusBadge = ({ status = 'DRAFT' }) => {
  const color = STATUS_COLORS[status] || 'secondary';

  return (
    <span className={`badge bg-${color} text-uppercase px-2 py-1 fs-8 fw-semibold`}>
      {status}
    </span>
  );
};

export default StatusBadge;
