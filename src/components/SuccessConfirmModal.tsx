import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

export type SuccessConfirmModalProps = {
  show: boolean;
  title?: string;
  description?: React.ReactNode;
  itemName?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
  confirmLabel?: string;
};

export function SuccessConfirmModal({
  show,
  title = "Delete item?",
  description,
  itemName,
  onCancel,
  onConfirm,
  loading = false,
  confirmLabel = "Close",
}: SuccessConfirmModalProps) {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      backdrop={loading ? "static" : true}
      keyboard={!loading}
    >
      {/* closeButton={!loading} */}
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {description ? <p>{description}</p> : null}
        {itemName ? (
          <p>
            <strong>{itemName}</strong> has been registered successfully.
          </p>
        ) : (
          <p>Success</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        {confirmLabel && (
          <Button
            variant="success"
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Success
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
