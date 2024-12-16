import * as yup from 'yup';

export const addProjectSchema = yup.object().shape({
    projectName: yup.string().required()
        .min(5, "Please choose a descriptive name of your project with at least 5 characters")
        .max(30, "Please choose a descriptive name of your project with less than 30 characters"),
    projectLabelSetId: yup.string().required("Must select a label set")
        .min(36, "Invalid Choice")
        .max(36, "Invalid Choice"),
});