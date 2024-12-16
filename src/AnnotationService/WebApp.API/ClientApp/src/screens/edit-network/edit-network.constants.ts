import {
    object,
    string
} from 'yup';

export const networkSchema = object().shape({
    name: string().required()
        .min(5, "Please choose a descriptive name of your project with at least 5 characters")
        .max(30, "Please choose a descriptive name of your project with less than 30 characters"),
    description: string()
        .max(1200, "Please choose a description with less than 120 characters"),
});