import * as yup from "yup";

export const addLabelSetSchema = yup.object().shape({
    name: yup.string().required()
        .min(5, "Please choose a descriptive name of your project with at least 5 characters")
        .max(30, "Please choose a descriptive name of your project with less than 30 characters"),
    description: yup.string().required()
        .min(5, "Please describe your label set with at least 5 characters")
        .max(120, "Please describe your label set with less than 120 characters"),
    labelNames: yup.mixed()
        .required()
        .test("minOneLabelName",
            "Add at least one label",
            (value) => {
                return value.length !== 0;
            }
        )

});