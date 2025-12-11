import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

export type DeleteConfirmModalProps = {
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

export function DeleteConfirmModal({
  show,
  title = "Delete item?",
  description,
  itemName,
  onCancel,
  onConfirm,
  loading = false,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: DeleteConfirmModalProps) {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      backdrop={loading ? "static" : true}
      keyboard={!loading}
      dialogClassName="delete-confirm-modal"
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {description ? <p>{description}</p> : null}
        {itemName ? (
          <p>
            This action will permanently delete <strong>{itemName}</strong>. You
            can’t undo this.
          </p>
        ) : (
          <p>This action is permanent and cannot be undone.</p>
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
              Deleting…
            </>
          ) : (
            confirmLabel
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
