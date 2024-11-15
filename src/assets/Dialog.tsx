import React from "react";
import "./Dialog.css";

interface DialogProps {
  header: string;
  message: string;
  toDelete: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const Dialog: React.FC<DialogProps> = ({
  header,
  message,
  toDelete,
  onCancel,
  onSuccess,
}) => {
  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <h4>{header}</h4>
        </div>
        <div className="dialog-message">{message}</div>
        <div className="dialog-actions">
          <button
            className="dialog-button dialog-button-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`dialog-button ${
              toDelete ? "dialog-button-delete" : "dialog-button-confirm"
            }`}
            onClick={onSuccess}
          >
            {toDelete ? "Delete" : "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
