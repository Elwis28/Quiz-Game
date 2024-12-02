// src/Modal.js
import React from 'react';
import './Modal.css';

function Modal({ onClose, children }) {
    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <button className="modal-close-button" onClick={onClose} aria-label="Close Modal">
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
}

export default Modal;

