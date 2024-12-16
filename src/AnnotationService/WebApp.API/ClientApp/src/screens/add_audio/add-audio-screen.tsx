import React, {useState} from "react";
import {useNavigate, useParams} from "react-router";
import authService from '../../components/api-authorization/AuthorizeService';
import {fileService} from "../../services/ApiService";
import './add-audio-screen.css'
import {Button, Col, Form, FormControl, Row, Spinner} from 'react-bootstrap';
import {Formik, FormikHelpers} from 'formik';
import {addAudioScreenSchema, tryGetDateTimeFromFileName} from './add-audio-screen.constants';
import {MapInput} from "../../components/ui/map-input/map-input";
import {MarkerLocation} from "../../components/ui/map-input/map-input.types";

type FormData = {
    file?: File,
    latitude?: number,
    longitude?: number,
    recordingStart?: string
}


const initialFormDataState: FormData = {}


export const AddAudioScreen: React.FC = () => {

    const [formData] = useState<FormData>(initialFormDataState);
    const params = useParams();
    const projectId = params.projectId!;

    const handleSubmit = async (form: FormData, {setFieldError}: FormikHelpers<FormData>): Promise<void> => {
        // e.preventDefault()
        const token = await authService.getAccessToken();
        const error = await fileService.postFile(token!, projectId, {
            content: form.file!,
            latitude: form.latitude,
            longitude: form.longitude,
            recordedStart: form.recordingStart ? new Date(form.recordingStart) : undefined
        });
        if (error) {
            setFieldError("file", error.errors.join(", "))
        } else {
            navigate(`/projects/${projectId}/files`, {replace: true})
        }
    }

    const navigate = useNavigate();

    return (
        <div>
            <Formik
                validateOnMount={true}
                initialValues={formData}
                validationSchema={addAudioScreenSchema}
                onSubmit={handleSubmit}>
                {({
                      handleSubmit,
                      handleChange,
                      handleBlur,
                      values,
                      touched,
                      isValid,
                      errors,
                      setValues,
                      setFieldValue,
                      isSubmitting
                  }) => {

                    const getMarkerLocation = (): MarkerLocation | undefined => {
                        if (!values.latitude || !values.longitude) return;

                        return {
                            latitude: values.latitude,
                            longitude: values.longitude
                        }
                    }

                    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                        if (event.target.files == null) return;

                        const uploadedFile: File = event.target.files[0];

                        const inferredDate = tryGetDateTimeFromFileName(uploadedFile.name);

                        if (inferredDate) {
                            setFieldValue("recordingStart", formatDateTime(inferredDate));
                        }

                        setFieldValue("file", uploadedFile);
                    };

                    if (!values.recordingStart) {
                        setFieldValue("recordingStart", formatDateTime(new Date()))
                    }


                    // const formattedDateTime = formatDateTime(values.recordingStart);

                    return (
                        <div>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group as={Col} md="4" className="mb-3" controlId="formUploadFile">
                                    <Form.Label>File</Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="file"
                                        onChange={onFileChange}
                                        onBlur={handleBlur}
                                        isValid={!errors.file}
                                        isInvalid={touched.file && !!errors.file}/>
                                    <FormControl.Feedback type="invalid">
                                        {errors.file}
                                    </FormControl.Feedback>
                                    <FormControl.Feedback type="valid">
                                        Looks good!
                                    </FormControl.Feedback>
                                </Form.Group>
                                <Row className="mb-3">
                                    <Form.Group as={Col} md="4" className="mb-3" controlId="formLatitude">
                                        <Form.Label>Latitude</Form.Label>

                                        <Form.Control
                                            type="number"
                                            name="latitude"
                                            value={values.latitude}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Latitude"
                                            isValid={!errors.latitude}
                                            isInvalid={touched.latitude && !!errors.latitude}
                                        />
                                        <FormControl.Feedback type="invalid">
                                            {errors.latitude}
                                        </FormControl.Feedback>
                                        <FormControl.Feedback type="valid">
                                            Looks good!
                                        </FormControl.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} md="4" className="mb-3" controlId="formLongitude">
                                        <Form.Label>Longitude</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="longitude"
                                            placeholder="Longitude"
                                            value={values.longitude}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isValid={!errors.longitude}
                                            isInvalid={touched.longitude && !!errors.longitude}/>
                                        <FormControl.Feedback type="invalid">
                                            {errors.longitude}
                                        </FormControl.Feedback>
                                        <FormControl.Feedback type="valid">
                                            Looks good!
                                        </FormControl.Feedback>
                                    </Form.Group>
                                </Row>
                                <Form.Group as={Col} md="4" className="mb-3" controlId="formRecordingStart">
                                    <Form.Label>Recording Start</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="recordingStart"
                                        value={values.recordingStart}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isValid={!errors.recordingStart}
                                        isInvalid={touched.recordingStart && !!errors.recordingStart}/>
                                    <FormControl.Feedback type="invalid">
                                        {errors.recordingStart}
                                    </FormControl.Feedback>
                                    <FormControl.Feedback type="valid">
                                        Looks good!
                                    </FormControl.Feedback>
                                </Form.Group>
                                <Row>
                                    <Col md="4">
                                        {
                                            <div className="d-grid">

                                                <Button disabled={isSubmitting || !isValid} className="mb-3"
                                                        type="submit">{
                                                    isSubmitting ?
                                                        <Spinner animation="grow" size="sm"></Spinner> : "Submit"
                                                }</Button>
                                            </div>

                                        }
                                    </Col>
                                </Row>
                            </Form>
                            <MapInput handleClick={(lat, lng) => setValues((prevValues) => {
                                return {
                                    ...prevValues,
                                    latitude: lat,
                                    longitude: lng
                                }
                            })} marker={getMarkerLocation()}/>
                        </div>
                    )
                }}
            </Formik>
        </div>

    )
}


const formatDateTime = (date: Date | undefined) => {
    if (!date) return "";

    console.log("FORMATTING FUNCTION: ", typeof date);

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + (date.getDate())).slice(-2);
    const hour = ('0' + (date.getHours())).slice(-2);
    const minute = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    const formatted = `${year}-${month}-${day}T${hour}:${minute}:${seconds}`

    console.log("FORMAT: ", formatted)
    return formatted;
}