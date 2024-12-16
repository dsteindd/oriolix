import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {Formik, FormikHelpers} from "formik";
import authService from "../../components/api-authorization/AuthorizeService";
import {labelSetService, projectService} from "../../services/ApiService";
import {addProjectSchema} from "../add-project/add-project-screen.constants";
import {Button, Col, Form, FormControl, Row, Spinner} from "react-bootstrap";
import {LabelSet} from "../../models/label-set";
import {ProjectModel, UserProject} from "../../models/projects";


type FormData = {
    projectName: string,
    projectDescription?: string,
    projectLabelSetId?: string,
    secondaryLabelSetId?: string
}

const initialFormDataState: FormData = {
    projectName: "",
    projectDescription: ""    
}

export const EditProject: React.FC = () => {

    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId!;
    const [labelSets, setLabelSets] = useState<LabelSet[]>();


    useEffect(() => {
        const _fetchProject = async () => {
            const token = await authService.getAccessToken();
            const project = await projectService.getProjectDetails(token, projectId);
            setFormData({
                projectName: project.name,
                projectDescription: project.description,
                projectLabelSetId: project.primaryLabelSetId,
                secondaryLabelSetId: project.secondaryLabelSetId
            })
        }

        _fetchProject()
    }, [])

    useEffect(() => {
        const _fetchLabelSets = async () => {
            const token = await authService.getAccessToken();
            const labelSets = await labelSetService.getLabelSets(token);
            setLabelSets(labelSets);
        }
        _fetchLabelSets();

    }, [projectId])

    const [formData, setFormData] = useState<FormData>(initialFormDataState);

    const navigate = useNavigate();
    const handleSubmit = async (form: FormData, {setFieldError}: FormikHelpers<FormData>): Promise<void> => {
        // e.preventDefault()
        const token = await authService.getAccessToken();

        const projectModel: ProjectModel = {
            name: form.projectName!,
            description: form.projectDescription,
            primaryLabelSetId: form.projectLabelSetId!,
            secondaryLabelSetId: form.secondaryLabelSetId === "None" ? undefined : form.secondaryLabelSetId 
        };
        
        console.log(projectModel)

        const error = await projectService.editProject(
            token!,
            projectId,
            projectModel
        );
        if (error) {
            setFieldError("project", error.errors.join(", "))
        } else {
            navigate("/projects", {replace: true})
        }
    }


    return (
        <div>
            <Formik
                validateOnMount={true}
                enableReinitialize={true}
                initialValues={formData}
                validationSchema={addProjectSchema}
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


                    return (
                        <div>
                            <Form onSubmit={handleSubmit}>

                                <Row className="mb-3">
                                    <Form.Group as={Col} md="4" className="mb-3" controlId="projectName">
                                        <Form.Label>Project Name</Form.Label>

                                        <Form.Control
                                            type="text"
                                            name="projectName"
                                            value={values.projectName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Project Name"
                                            isValid={!errors.projectName}
                                            isInvalid={touched.projectName && !!errors.projectName}
                                        />
                                        <FormControl.Feedback type="invalid">
                                            {errors.projectName}
                                        </FormControl.Feedback>
                                        <FormControl.Feedback type="valid">
                                            Looks good!
                                        </FormControl.Feedback>
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group as={Col} md="4" className="mb-3" controlId="projectDescription">
                                        <Form.Label>Project Description</Form.Label>

                                        <Form.Control
                                            type="text"
                                            name="projectDescription"
                                            value={values.projectDescription}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Project Description"
                                            isValid={!errors.projectDescription}
                                            isInvalid={touched.projectDescription && !!errors.projectDescription}
                                        />
                                        <FormControl.Feedback type="invalid">
                                            {errors.projectDescription}
                                        </FormControl.Feedback>
                                        <FormControl.Feedback type="valid">
                                            Looks good!
                                        </FormControl.Feedback>
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group as={Col} md="4" controlId="labelSet">
                                        <Form.Label>Label Set</Form.Label>
                                        <Form.Select
                                            name="projectLabelSetId"
                                            value={values.projectLabelSetId}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isValid={!errors.projectLabelSetId}
                                            isInvalid={touched.projectLabelSetId && !!errors.projectLabelSetId}
                                        >
                                            <option>Select a Label Set</option>
                                            {
                                                labelSets && labelSets.length !== 0 ?
                                                    labelSets.map(ls => <option key={ls.id} value={ls.id}>{ls.name}</option>) : null
                                            }
                                        </Form.Select>
                                        <FormControl.Feedback type="invalid">
                                            {errors.projectName}
                                        </FormControl.Feedback>
                                        <FormControl.Feedback type="valid">
                                            Looks good!
                                        </FormControl.Feedback>
                                    </Form.Group>

                                </Row>
                                <Row className="mb-3">
                                    <Form.Group as={Col} md="4" controlId="secondaryLabelSet">
                                        <Form.Label>Secondary Label Set</Form.Label>
                                        <Form.Select
                                            name="secondaryLabelSetId"
                                            value={values.secondaryLabelSetId}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isValid={!errors.secondaryLabelSetId}
                                            isInvalid={touched.secondaryLabelSetId && !!errors.secondaryLabelSetId}
                                        >
                                            <option value={"None"}>Select a Label Set</option>
                                            {
                                                labelSets && labelSets.length !== 0 ?
                                                    labelSets.map(ls => <option key={ls.id} value={ls.id}>{ls.name}</option>) : null
                                            }
                                        </Form.Select>
                                        <FormControl.Feedback type="invalid">
                                            {errors.secondaryLabelSetId}
                                        </FormControl.Feedback>
                                        <FormControl.Feedback type="valid">
                                            Looks good!
                                        </FormControl.Feedback>
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
        </div>

    )
}