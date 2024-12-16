import {Button, Modal} from "react-bootstrap";
import React, {ReactNode} from "react";

interface ConfirmModalProps {
    title?: string,
    content?: ReactNode,
    handleConfirm: () => void,
    handleCancel: () => void,
    isOpen: boolean,
    onHide: () => void
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
                                                              title,
                                                              content,
                                                              handleConfirm,
                                                              handleCancel,
                                                              isOpen,
                                                              onHide
                                                          }) => {


    return (
        <Modal
            show={isOpen}
            onHide={onHide}
        >
            <Modal.Header className="text-bold">
                {title}
            </Modal.Header>
            <Modal.Body>
                {content}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="danger"
                    onClick={() => handleConfirm()}>
                    Confirm Deletion
                </Button>
                <Button
                    variant="primary"
                    onClick={handleCancel}>
                    Cancel
                </Button>
            </Modal.Footer>

        </Modal>)
}