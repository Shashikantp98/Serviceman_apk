import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

export type LoginModalProps = {
  show: boolean;
  title?: string;
  description?: React.ReactNode;
  itemName?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function LoginModal({
  show,
  title = "Login",
  description,
  itemName,
  onCancel,
  onConfirm,
  loading = false,
  confirmLabel = "Login",
  cancelLabel = "Cancel",
}: LoginModalProps) {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      backdrop={loading ? "static" : true}
      keyboard={!loading}
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {description ? <p>{description}</p> : null}
        {itemName ? (
          <p>Please login as Customer to continue</p>
        ) : (
          <p>Please login as Customer to continue</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant="danger"
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
              Login
            </>
          ) : (
            confirmLabel
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
