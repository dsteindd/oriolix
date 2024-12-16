import {Annotation} from "../models/annotations";

export const getAnnotationFromTime = (annotation: Annotation) => {
    return Math.min(
        ...annotation
            .points
            .map(p => p.time)
    )
}

export const getAnnotationToTime = (annotation: Annotation) => {
    return Math.max(
        ...annotation
            .points
            .map(p => p.time)
    )
}