import React, {useState} from 'react';
import {useNavigate} from "react-router";
import {Formik, FormikHelpers} from "formik";
import {Button, Col, Form, FormControl, Row, Spinner} from "react-bootstrap";
import {addLabelSetSchema} from "./add-label-set.constants";
import {Divider, IconButton, ListItem, ListItemText, Tooltip} from "@mui/material";
import {MdCancel, MdCheck, MdHelp} from "react-icons/md";
import {green} from "@mui/material/colors";
import {FixedSizeList} from "react-window";
import {labelSetService} from "../../services/ApiService";
import authService from "../../components/api-authorization/AuthorizeService";

type FormData = {
    name: string,
    description: string,
    labelNames: string[],
    labelAltNames: string[],
    isPublic: boolean
}


const initialFormDataState: FormData = {
    name: "",
    description: "",
    labelNames: [],
    labelAltNames: [],
    isPublic: false
}


export const AddLabelSetScreen: React.FC = () => {

    const [formData] = useState<FormData>(initialFormDataState);

    const handleSubmit = async (form: FormData, {setFieldError}: FormikHelpers<FormData>): Promise<void> => {
        
        
        const token = await authService.getAccessToken();
        const error = await labelSetService.createLabelSet(token!, {
            name: form.name!,
            description: form.description!,
            isPublic: form.isPublic!,
            labelNames: form.labelNames!,
            labelAltNames: form.labelAltNames!
        });
        if (error) {
            setFieldError("file", error.errors.join(", "))
        } else {
            navigate(`/label-sets`, {replace: true})
        }
    }

    const navigate = useNavigate();


    const [tempName, setTempName] = useState("");
    const [tempAltName, setTempAltName] = useState("");

    const [isManualLabelEntry, setIsManualLabelEntry] = useState(false);


    return (
        <div>
            <Formik
                validateOnMount={true}
                initialValues={formData}
                validationSchema={addLabelSetSchema}
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
                      isSubmitting
                  }) => {

                    const onLabelNameFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                        if (event.target.files == null) return;

                        const uploadedFile: File = event.target.files[0]

                        const reader = new FileReader();
                        reader.onload = (progressEvent: ProgressEvent<FileReader>) => {
                            const lines = (progressEvent?.target?.result as string).split(/\r\n|\n/)
                                .filter(l => l !== "");
                            
                            const names: string[] = []
                            const altNames: string[] = []
                            
                            for (let index = 0; index < lines.length; index++){
                                const splitted = lines[index].split(",")
                                if (splitted.length == 1){
                                    names.push(splitted[0].trim())
                                    altNames.push("")
                                }
                                else if (splitted.length == 2){
                                    names.push(splitted[0].trim())
                                    altNames.push(splitted[1].trim())
                                }
                            }
                            
                            setValues(values => {
                                return {
                                    ...values,
                                    labelNames: names,
                                    labelAltNames: altNames
                                }
                            })
                        }
                        reader.readAsText(uploadedFile)

                    };
                    
                    const _handleAcceptNewLabel = () => {
                        if (!!tempName && tempName !== "") {
                            const newLabelNames = [...values.labelNames]
                            newLabelNames.push(tempName);

                            const newLabelAltNames = [...values.labelAltNames]
                            newLabelAltNames.push(tempAltName);

                            setValues(values => {
                                return {
                                    ...values,
                                    labelNames: newLabelNames,
                                    labelAltNames: newLabelAltNames
                                }
                            })

                            setTempAltName("")
                            setTempName("")
                        }
                    }

                    const _deleteLabelAtIndex = (index: number) => {
                        console.log(index)
                        
                        const newLabelNames = values.labelNames.slice()
                        newLabelNames.splice(index, 1)
                        const newLabelAltNames = values.labelAltNames.slice()
                        newLabelAltNames.splice(index, 1)

                        console.log(newLabelNames)
                        console.log(newLabelAltNames)
                        
                        setValues(values => {
                            return {
                                ...values,
                                labelNames: newLabelNames,
                                labelAltNames: newLabelAltNames
                            }
                        })
                    }
                    console.log(values.labelNames)
                    console.log(errors)

                    return (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col} md="4" className="mb-3" controlId="labelSetNameControl">
                                    <Form.Label>Label Set Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={values.name}
                                        placeholder="Enter a name for your label set"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isValid={!errors.name}
                                        isInvalid={touched.name && !!errors.name}/>
                                    <FormControl.Feedback type="invalid">
                                        {errors.name}
                                    </FormControl.Feedback>
                                    <FormControl.Feedback type="valid">
                                        Looks good!
                                    </FormControl.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} md="4" className="mb-3" controlId="labelSetDescription">
                                    <Form.Label>Label Set Description</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="description"
                                        value={values.description}
                                        placeholder="Enter a description for your label set"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isValid={!errors.description}
                                        isInvalid={touched.description && !!errors.description}/>
                                    <FormControl.Feedback type="invalid">
                                        {errors.description}
                                    </FormControl.Feedback>
                                    <FormControl.Feedback type="valid">
                                        Looks good!
                                    </FormControl.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className="mb-3">
                                <Form.Group as={Col} md="4">
                                    <Form.Check
                                        type="switch"
                                        name="isPublic"
                                        label="Make label set public"
                                        checked={values.isPublic}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Form.Group>
                            </Row>
                            <Divider className="mb-3"/>
                            <Row className="mb-3">
                                <Form.Group>
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="Manual Label Entry"
                                        checked={isManualLabelEntry}
                                        onChange={() => setIsManualLabelEntry(checked => !checked)}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="File Upload"
                                        checked={!isManualLabelEntry}
                                        onChange={() => setIsManualLabelEntry(checked => !checked)}
                                    />
                                </Form.Group>
                            </Row>
                            {
                                isManualLabelEntry ? (
                                    <>
                                        <Row className="mb-3">
                                            <Col md="3">
                                                <Form.Group>
                                                    <Form.Label>Label Name</Form.Label>
                                                    <Form.Control
                                                        className="mb-3"
                                                        type="text"
                                                        value={tempName}
                                                        placeholder="New Label Name"
                                                        onChange={(e) => setTempName(e.target.value)}
                                                        onBlur={handleBlur}
                                                    />
                                                    <Form.Label>Label Alternative Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={tempAltName}
                                                        placeholder="New Label AltName"
                                                        onChange={(e) => setTempAltName(e.target.value)}
                                                        onBlur={handleBlur}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md="1" className="d-flex align-items-end">
                                                <IconButton edge="end"
                                                            sx={{
                                                                backgroundColor: green[200],
                                                                '&:hover': {
                                                                    backgroundColor: green[400]
                                                                }
                                                            }}
                                                            onClick={_handleAcceptNewLabel}>
                                                    <MdCheck/>
                                                </IconButton>
                                            </Col>
                                        </Row>
                                        <h5>Your Labels</h5>
                                        <FixedSizeList
                                            className="mb-3"
                                            itemSize={76} 
                                            height={380}
                                            itemCount={values.labelNames.length} 
                                            width="40%"
                                            overscanCount={5}
                                        >
                                            {({index, style}) => {
                                                return (
                                                    <div style={{
                                                        ...style,
                                                        borderBottom: "1px solid #ddd"
                                                    }}>
                                                        <ListItem 
                                                            key={index}
                                                            sx={{height: style.height}}
                                                            secondaryAction={
                                                                <IconButton edge="end"
                                                                            onClick={() => {
                                                                                _deleteLabelAtIndex(index)
                                                                            }}>
                                                                    <MdCancel/>
                                                                </IconButton>
                                                            }    
                                                        >
                                                            <ListItemText
                                                                primary={values.labelNames[index]}
                                                                secondary={values.labelAltNames[index]}/>
                                                        </ListItem>
                                                    </div>
                                            )
                                            }}
                                        </FixedSizeList>
                                    </>
                                ) : (
                                    <>
                                        <Row className="mb-3">
                                            <Col md="4">
                                                <Form.Group controlId="labelNameFile">
                                                    <Form.Label>
                                                        Label Names & AltNames
                                                        
                                                        <Tooltip 
                                                            title={"Upload a file with 2 columns. The first column" +
                                                                " should be the label name and the second column" +
                                                                " should be the alternative name (e.g. translation)." +
                                                                " Label name and alternative name should be" +
                                                                " separated by comma."}>
                                                            <IconButton>

                                                                <MdHelp/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Form.Label>
                                                    <Form.Control
                                                        className="mb-3"
                                                        type="file"
                                                        value={tempName}
                                                        onChange={onLabelNameFileChange}
                                                        // onBlur={handleBlur}
                                                    />
                                                </Form.Group>
                                                {/*<Form.Group controlId="labelAltNameFile">*/}
                                                {/*    <Form.Label>Label Alternative Names</Form.Label>*/}
                                                {/*    <Form.Control*/}
                                                {/*        type="file"*/}
                                                {/*        value={tempAltName}*/}
                                                {/*        onChange={onLabelAltNamesFileChange}*/}
                                                {/*        // onBlur={handleBlur}*/}
                                                {/*    />*/}
                                                {/*</Form.Group>*/}
                                            </Col>
                                        </Row>
                                        <FixedSizeList
                                            className="mb-3"
                                            itemSize={76}
                                            height={380}
                                            itemCount={values.labelNames.length}
                                            width="40%"
                                            overscanCount={5}
                                        >
                                            {({index, style}) => {
                                                return (
                                                    <div style={{
                                                        ...style,
                                                        borderBottom: "1px solid #ddd"
                                                    }}>
                                                        <ListItem
                                                            key={index}
                                                            sx={{height: style.height}}
                                                            secondaryAction={
                                                                <IconButton edge="end"
                                                                            onClick={() => {
                                                                                console.log("Delete Index ", index)
                                                                                _deleteLabelAtIndex(index)
                                                                            }}>
                                                                    <MdCancel/>
                                                                </IconButton>
                                                            }
                                                        >
                                                            <ListItemText
                                                                primary={values.labelNames[index]}
                                                                secondary={values.labelAltNames[index]}/>
                                                        </ListItem>
                                                    </div>
                                                )
                                            }}
                                        </FixedSizeList>
                                        
                                        {/*<List*/}
                                        {/*    sx={{width: '40%', backgroundColor: 'background.paper'}}*/}
                                        {/*    subheader={<ListSubheader>Your Labels</ListSubheader>}*/}
                                        {/*>*/}
                                        {/*    {*/}
                                        {/*        values.labelNames.length !== 0 ? values.labelNames.map((name, index) => {*/}
                                        {/*            return (*/}
                                        {/*                <>*/}
                                        {/*                    <ListItem*/}
                                        {/*                        secondaryAction={*/}
                                        {/*                            <IconButton edge="end"*/}
                                        {/*                                        onClick={() => {*/}
                                        {/*                                            _deleteLabelAtIndex(index)*/}
                                        {/*                                        }}>*/}
                                        {/*                                <MdCancel/>*/}
                                        {/*                            </IconButton>*/}
                                        {/*                        }*/}
                                        {/*                    >*/}
                                        {/*                        <ListItemText primary={name}/>*/}
                                        {/*                        <ListItemText primary={values.labelAltNames.length > index ? values.labelAltNames[index] : ""}/>*/}
                                        {/*                    </ListItem>*/}
                                        {/*                    <Divider/>*/}
                                        {/*                </>*/}
                                        {/*            );*/}
                                        {/*        }) : (*/}
                                        {/*            <ListItem>*/}
                                        {/*                <ListItemText primary="Start adding some labels..."/>*/}
                                        {/*            </ListItem>*/}
                                        {/*        )*/}
                                        {/*    }*/}
                                        {/*</List>*/}
                                    </>

                                )
                            }

                            {/*<Col md="1">*/}
                            {/*    <div className="vr" style={{height: "100%"}}></div>*/}
                            {/*</Col>*/}
                            {/*<Col>*/}
                            {/*    <Form.Group as={Col} md="3" className="mb-3">*/}
                            {/*        <Form.Label>Label Name</Form.Label>*/}
                            {/*        <Form.Control*/}
                            {/*            className="mb-3"*/}
                            {/*            type="text"*/}
                            {/*            value={tempName}*/}
                            {/*            name="labelNames"*/}
                            {/*            placeholder="New Label Name"*/}
                            {/*            onChange={(e) => setTempName(e.target.value)}*/}
                            {/*            onBlur={handleBlur}*/}
                            {/*        />*/}
                            {/*        <Form.Label>Label Alternative Name</Form.Label>*/}
                            {/*        <Form.Control*/}
                            {/*            type="text"*/}
                            {/*            value={tempAltName}*/}
                            {/*            placeholder="New Label AltName"*/}
                            {/*            onChange={(e) => setTempAltName(e.target.value)}*/}
                            {/*            onBlur={handleBlur}*/}
                            {/*        />*/}
                            {/*    </Form.Group>*/}
                            {/*</Col>*/}


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
                    )
                }}
            </Formik>
        </div>

    )
}