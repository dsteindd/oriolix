import {Button, Form, FormControl, Modal, Spinner} from 'react-bootstrap';
import React, {useEffect} from 'react';
import {Formik, FormikHelpers} from 'formik';
import {shareModalSchema} from './share-modal-constants';
import {ShareInfo} from '../../../models/file-info';
import {ErrorResponse} from '../../../services/ApiService';
import {Divider, IconButton, List, ListItem, ListItemText, ListSubheader} from "@mui/material";
import {MdCancel} from "react-icons/md";

interface ShareModalProps {
    isOpen: boolean,
    id: string,
    shareInfos: ShareInfo[],
    closeModal: () => void,
    resetShareInfo: (id: string) => void,
    onShare: (mail: string) => Promise<ErrorResponse | undefined>,
    onUnshare: (shareInfo: ShareInfo) => Promise<void>
}

interface ShareModalState {
    mail: string
}

export const ShareModal: React.FC<ShareModalProps> = ({
                                                          isOpen,
                                                          id,
                                                          shareInfos,
                                                          closeModal,
                                                          resetShareInfo,
                                                          onShare,
                                                          onUnshare
                                                      }) => {

    useEffect(() => {
        if (isOpen) {
            resetShareInfo(id);
        }

    }, [isOpen])


    const _handleSubmit = async (
        id: string,
        submitMail: string,
        {setFieldError}: FormikHelpers<ShareModalState>) => {

        const error = await onShare(submitMail);

        if (error) {
            setFieldError("mail", error.detail);
        } else {
            resetShareInfo(id);
        }
    }

    const _handleUnshare = async (
        shareInfo: ShareInfo
    ) => {
        await onUnshare(shareInfo);
        await resetShareInfo(id);
    }

    return (
        <Modal
            show={isOpen}
            onHide={closeModal}>
            <Modal.Header closeButton>
                <Modal.Title>Share your project</Modal.Title>
            </Modal.Header>
            <Formik
                enableReinitialize
                validateOnMount={true}
                initialValues={{mail: ''}}
                validationSchema={shareModalSchema(shareInfos?.map(si => si.email))}
                onSubmit={async (values, actions) => await _handleSubmit(id, values.mail!, actions)}
            >
                {({
                      handleSubmit,
                      handleChange,
                      handleBlur,
                      values,
                      touched,
                      isValid,
                      errors,
                      isSubmitting
                  }) => {
                    return <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Form.Group className='mb-3' controlId="mailInput">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="mail"
                                    value={values.mail}
                                    placeholder="max.mustermann@muster.de"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isValid={!errors.mail}
                                    isInvalid={touched.mail && !!errors.mail}
                                />
                                <FormControl.Feedback type="valid">
                                    Looks good!
                                </FormControl.Feedback>
                                <FormControl.Feedback type="invalid">
                                    {errors.mail}
                                </FormControl.Feedback>
                            </Form.Group>
                            <ShareInfoList
                                shareInfos={shareInfos}
                                onUnshare={_handleUnshare}
                            />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" type="submit"
                                    disabled={!isValid || isSubmitting}>{isSubmitting ?
                                <Spinner animation="grow" size="sm"></Spinner> : "Share"}</Button>
                            <Button variant="secondary" onClick={closeModal}>Close</Button>
                        </Modal.Footer>
                    </Form>
                }}
            </Formik>
        </Modal>)
}

interface ShareInfoListProps {
    shareInfos: ShareInfo[],
    onUnshare: (shareInfo: ShareInfo) => Promise<void>
}

const ShareInfoList: React.FC<ShareInfoListProps> = ({
                                                         shareInfos,
                                                         onUnshare
                                                     }) => {
    return (
        <List
            subheader={
            <ListSubheader>
                Shared with: 
            </ListSubheader>
            }
        >
            {shareInfos.map(si => <ShareInfoItem key={si.userId} shareInfo={si} onUnshare={onUnshare}/>)}
        </List>
    )
}


interface ShareInfoItemProps {
    shareInfo: ShareInfo,
    onUnshare: (shareInfo: ShareInfo) => Promise<void>
}

const ShareInfoItem: React.FC<ShareInfoItemProps> = ({
                                                         shareInfo,
                                                         onUnshare
                                                     }) => {
    return (
        <ListItem
            secondaryAction={
                <IconButton
                    onClick={() => onUnshare(shareInfo)}
                >
                    <MdCancel/>
                </IconButton>
            }
        >
            <ListItemText
                primary={shareInfo.userName}
                secondary={shareInfo.email}
            />
            <Divider/>
        </ListItem>
    )
}