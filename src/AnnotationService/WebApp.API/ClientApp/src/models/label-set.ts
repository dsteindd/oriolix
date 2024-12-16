import {bool} from "yup";

export type LabelSet = {
    id: string,
    name: string,
    description: string,
    labels: Label[],
    isPublic: boolean,
    isOwner: boolean
}

export type Label = {
    id: string,
    name: string,
    altName?: string
}

export type AddLabelSetDTO = {
    name: string,
    description: string,
    isPublic: boolean,
    labelNames: string[],
    labelAltNames: string[]
}

export type ProjectLabels = {
    primary: Label[],
    secondary?: Label[]
}