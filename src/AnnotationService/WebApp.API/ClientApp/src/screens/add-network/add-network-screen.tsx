import React, {ChangeEvent, useState} from "react";
import {useNavigate} from "react-router";
import {Formik, FormikHelpers} from "formik";
import authService from "../../components/api-authorization/AuthorizeService";
import {networkService} from "../../services/ApiService";
import {networkSchema} from "./add-network.constants";
import {Button, Col, Form, FormControl, Row, Spinner} from "react-bootstrap";
import {AddNetworkModel} from "../../models/network-models";


type FormData = {
    name: string,
    description?: string,
    // imageWidth?: number,
    // imageHeight?: number,
    isPublic: boolean,
    modelFile?: File,
    labelFile?: File
}

const initialFormDataState: FormData = {
    name: "",
    isPublic: false,
}

export const AddNetworkScreen: React.FC = () => {

    const [formData] = useState<FormData>(initialFormDataState);

    const navigate = useNavigate();
    const handleSubmit = async (form: FormData, {setFieldError}: FormikHelpers<FormData>): Promise<void> => {
        // e.preventDefault()
        const token = await authService.getAccessToken();

        console.log(form)

        const addNetworkModel: AddNetworkModel = {
            name: form.name!,
            description: form.description,
            // inputImageHeight: form.imageHeight!,
            // inputImageWidth: form.imageWidth!,
            // isGrayscale: form.isGrayscale!,
            isPublic: form.isPublic!,
            networkFile: form.modelFile!,
            labelFile: form.labelFile!
        }

        const error = await networkService.addModel(token,  addNetworkModel);

        if (error){
            setFieldError("name", error.errors.join(","));
        } else {
            navigate("/networks", {replace: true})
        }
    }


    return (
        <Formik
            validateOnMount={true}
            enableReinitialize={true}
            initialValues={formData}
            validationSchema={networkSchema}
            onSubmit={handleSubmit}>
            {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  values,
                  touched,
                  isValid,
                  errors,
                  setFieldValue,
                  isSubmitting
              }) => {
                
                console.log(values)

                const onFileChange = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
                    if (event.target.files == null) return;
                    
                    setFieldValue(key, event.target.files[0]);
                };

                return (
                    <div>
                        <Form onSubmit={handleSubmit}>

                            <Row className="mb-3">
                                <Form.Group as={Col} md="4" className="mb-3" controlId="name">
                                    <Form.Label>Project Name</Form.Label>

                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={values.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Network Name"
                                        isValid={!errors.name}
                                        isInvalid={touched.name && !!errors.name}
                                    />
                                    <FormControl.Feedback type="invalid">
                                        {errors.name}
                                    </FormControl.Feedback>
                                    <FormControl.Feedback type="valid">
                                        Looks good!
                                    </FormControl.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col} md="8" className="mb-3" controlId="networkDescription">
                                    <Form.Label>Network Description</Form.Label>

                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        type="text"
                                        name="description"
                                        value={values.description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Network Description"
                                        isValid={!errors.description}
                                        isInvalid={touched.description && !!errors.description}
                                    />
                                    <FormControl.Feedback type="invalid">
                                        {errors.description}
                                    </FormControl.Feedback>
                                    <FormControl.Feedback type="valid">
                                        Looks good!
                                    </FormControl.Feedback>
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} md="4" className="mb-3" controlId="formModelFile">
                                    <Form.Label>Model File</Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="modelFile"
                                        onChange={(e) => onFileChange(e as ChangeEvent<HTMLInputElement>, "modelFile")}
                                        onBlur={handleBlur}
                                        isValid={!errors.modelFile}
                                        isInvalid={touched.modelFile && !!errors.modelFile}/>
                                    <FormControl.Feedback type="invalid">
                                        {errors.modelFile}
                                    </FormControl.Feedback>
                                    <FormControl.Feedback type="valid">
                                        Looks good!
                                    </FormControl.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} md="4" className="mb-3" controlId="formLabelsFile">
                                    <Form.Label>File</Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="labelFile"
                                        onChange={(e) => onFileChange(e as ChangeEvent<HTMLInputElement>, "labelFile")}
                                        onBlur={handleBlur}
                                        isValid={!errors.labelFile}
                                        isInvalid={touched.labelFile && !!errors.labelFile}/>
                                    <FormControl.Feedback type="invalid">
                                        {errors.labelFile}
                                    </FormControl.Feedback>
                                    <FormControl.Feedback type="valid">
                                        Looks good!
                                    </FormControl.Feedback>
                                </Form.Group>
                            </Row>


                            {/*<Row className="mb-3">*/}
                            {/*    <Form.Group as={Col} md="4" controlId="imageWidth">*/}
                            {/*        <Form.Label>Image Width</Form.Label>*/}
                            {/*        <Form.Control*/}
                            {/*            type="number"*/}
                            {/*            name="imageWidth"*/}
                            {/*            value={values.imageWidth}*/}
                            {/*            onChange={handleChange}*/}
                            {/*            onBlur={handleBlur}*/}
                            {/*            placeholder="Image Width"*/}
                            {/*            isValid={!errors.imageWidth}*/}
                            {/*            isInvalid={touched.imageWidth && !!errors.imageWidth}*/}
                            {/*        />*/}
                            {/*        <FormControl.Feedback type="invalid">*/}
                            {/*            {errors.imageWidth}*/}
                            {/*        </FormControl.Feedback>*/}
                            {/*        <FormControl.Feedback type="valid">*/}
                            {/*            Looks good!*/}
                            {/*        </FormControl.Feedback>*/}
                            {/*    </Form.Group>*/}
                            {/*    <Form.Group as={Col} md="4" controlId="imageHeight">*/}
                            {/*        <Form.Label>Image Width</Form.Label>*/}
                            {/*        <Form.Control*/}
                            {/*            type="number"*/}
                            {/*            name="imageHeight"*/}
                            {/*            value={values.imageHeight}*/}
                            {/*            onChange={handleChange}*/}
                            {/*            onBlur={handleBlur}*/}
                            {/*            placeholder="Image Height"*/}
                            {/*            isValid={!errors.imageHeight}*/}
                            {/*            isInvalid={touched.imageHeight && !!errors.imageHeight}*/}
                            {/*        />*/}
                            {/*        <FormControl.Feedback type="invalid">*/}
                            {/*            {errors.imageHeight}*/}
                            {/*        </FormControl.Feedback>*/}
                            {/*        <FormControl.Feedback type="valid">*/}
                            {/*            Looks good!*/}
                            {/*        </FormControl.Feedback>*/}
                            {/*    </Form.Group>*/}
                            {/*</Row>*/}
                            {/*<Row className="mb-3">*/}
                            {/*    <Form.Group as={Col} md="4" controlId="isGrayscale">*/}
                            {/*        <Form.Check*/}
                            {/*            type="radio"*/}
                            {/*            name="isGrayscale"*/}
                            {/*            label="Grayscale Image"*/}
                            {/*            checked={values.isGrayscale}*/}
                            {/*            onChange={(e) => setFieldValue("isGrayscale", e.currentTarget.checked)}*/}
                            {/*            onBlur={handleBlur}*/}
                            {/*        />*/}
                            {/*        <Form.Check*/}
                            {/*            type="radio"*/}
                            {/*            name="isGrayscale"*/}
                            {/*            label="RGB"*/}
                            {/*            checked={!values.isGrayscale}*/}
                            {/*            onChange={(e) => setFieldValue("isGrayscale", !e.currentTarget.checked)}*/}
                            {/*            onBlur={handleBlur}*/}
                            {/*        />*/}
                            {/*    </Form.Group>*/}
                            {/*</Row>*/}
                            <Row className="mb-3">
                                <Form.Group as={Col} md="4">
                                    <Form.Check
                                        type="switch"
                                        name="isPublic"
                                        label="Make Neural Network Public"
                                        checked={values.isPublic}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Form.Group>
                            </Row>
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
                    </div>
                )
            }}
        </Formik>
    )
}