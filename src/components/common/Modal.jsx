import React from 'react';

const Modal = ({ isOpen, onClose, title, children, footerButtons }) => {
  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold text-dark">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body p-4">{children}</div>
          {footerButtons && <div className="modal-footer border-top">{footerButtons}</div>}
        </div>
      </div>
    </div>
  );
};

export default Modal;
