import React from 'react';

const ToastNotification = ({ toast, onClose }) => {
  if (!toast) return null;

  const bgClass = toast.type === 'success' ? 'bg-success' : toast.type === 'danger' ? 'bg-danger' : 'bg-info';

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1080 }}>
      <div className={`toast show text-white ${bgClass} border-0 shadow-lg`} role="alert">
        <div className="d-flex align-items-center">
          <div className="toast-body d-flex align-items-center gap-2">
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
            <div>
              <strong>{toast.title || 'Notification'}</strong>
              <div className="fs-7">{toast.message}</div>
            </div>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
