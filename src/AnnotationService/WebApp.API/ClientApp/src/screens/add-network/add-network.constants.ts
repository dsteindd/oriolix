import {
    object,
    string
} from 'yup';
import * as yup from "yup";
import {getFileExtension} from "../../utils/formatting/file-extensions";

export const networkSchema = object().shape({
    name: string().required()
        .min(5, "Please choose a descriptive name of your project with at least 5 characters")
        .max(30, "Please choose a descriptive name of your project with less than 30 characters"),
    description: string()
        .max(1200, "Please choose a description with less than 120 characters"),
    modelFile: yup.mixed()
        .required("Model file is required")
        .test(
            "Format",
            "Only .h5 files are supported",
            (value) => {
                // Don't return an error here, if file is not defined
                if (!value) return true;

                // return error if file with no extension has been chosen
                const fileExt = value.name && getFileExtension(value.name);
                
                console.log(fileExt)

                if (!fileExt) return false;
                
                return supportedModelFileEndings.includes(fileExt.toLowerCase());
            }
        ),
    labelFile: yup.mixed()
        .required("Labels file is required")
        .test(
            "Format",
            "Only .txt files are supported",
            (value) => {
                // Don't return an error here, if file is not defined
                if (!value) return true;

                // return error if file with no extension has been chosen
                const fileExt = value.name && getFileExtension(value.name);
                
                if (!fileExt) return false;

                return supportedLabelsFileEndings.includes(fileExt.toLowerCase());
            }
        ),
    
});

const supportedModelFileEndings = [
    "h5"
]

const supportedLabelsFileEndings = [
    "txt"
]